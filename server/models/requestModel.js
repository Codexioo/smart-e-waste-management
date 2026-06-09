const db = require('../database');

const generateRequestCode = () => {
  const random = Math.floor(100000 + Math.random() * 900000);
  return `#${random}`;
};

const insertRequest = (data, callback) => {
  const { address, district, city, user_id, waste_types, latitude, longitude } = data;
  const create_date = new Date().toISOString();
  const status = 'pending';
  const request_code = generateRequestCode();
  const wasteStr = waste_types.join(',');

  const sql = `
    INSERT INTO pickup_requests (request_code, address, district, city, waste_types, create_date, status, latitude, longitude, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [request_code, address, district, city, wasteStr, create_date, status, latitude, longitude, user_id], function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, request_code, ...data, status, create_date });
  });
};

const getRequestsByUserId = (userId, callback) => {
  const sql = `SELECT * FROM pickup_requests WHERE user_id = ? ORDER BY id DESC`;
  db.all(sql, [userId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

const getRequestsByCollectorId = (collectorId, callback) => {
  const sql = `
    SELECT pr.*, u.username AS customer_name, u.email AS customer_email, u.telephone AS customer_telephone
    FROM pickup_requests pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.collector_id = ?
    ORDER BY pr.create_date DESC
  `;
  db.all(sql, [collectorId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

const getRequestByIdForCollector = (requestId, collectorId, callback) => {
  const sql = `
    SELECT pr.*, u.username AS customer_name, u.email AS customer_email, u.telephone AS customer_telephone
    FROM pickup_requests pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.id = ? AND pr.collector_id = ?
  `;
  db.get(sql, [requestId, collectorId], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
};

const startRequestByCollector = (requestId, collectorId, callback) => {
  const startedAt = new Date().toISOString();
  const sql = `
    UPDATE pickup_requests
    SET started_at = ?
    WHERE id = ? AND collector_id = ? AND status = 'Assigned' AND started_at IS NULL
  `;
  db.run(sql, [startedAt, requestId, collectorId], function (err) {
    if (err) return callback(err);
    callback(null, { changes: this.changes, started_at: startedAt });
  });
};

const collectRequestByCollector = (requestId, collectorId, wasteWeight, callback) => {
  const collectedAt = new Date().toISOString();
  const sql = `
    UPDATE pickup_requests
    SET collected_at = ?, waste_weight = ?
    WHERE id = ? AND collector_id = ? AND status = 'Assigned' AND started_at IS NOT NULL
  `;
  db.run(sql, [collectedAt, wasteWeight, requestId, collectorId], function (err) {
    if (err) return callback(err);
    callback(null, { changes: this.changes, collected_at: collectedAt, waste_weight: wasteWeight });
  });
};

const completeRequestByCollector = (requestId, collectorId, callback) => {
  const sql = `
    UPDATE pickup_requests
    SET status = 'completed'
    WHERE id = ? AND collector_id = ? AND status = 'Assigned'
  `;
  db.run(sql, [requestId, collectorId], function (err) {
    if (err) return callback(err);
    callback(null, { changes: this.changes });
  });
};

const getCollectorStats = (collectorId, callback) => {
  const sql = `
    SELECT
      SUM(CASE WHEN pr.status = 'Assigned' AND pr.started_at IS NULL THEN 1 ELSE 0 END) AS assigned_count,
      SUM(CASE WHEN pr.status = 'Assigned' AND pr.started_at IS NOT NULL AND pr.collected_at IS NULL THEN 1 ELSE 0 END) AS in_progress_count,
      SUM(CASE WHEN pr.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
      SUM(CASE WHEN pr.status = 'rejected' AND pr.collector_id = ? THEN 1 ELSE 0 END) AS cancelled_count,
      SUM(CASE WHEN pr.status = 'Assigned' AND pr.started_at IS NOT NULL THEN 1 ELSE 0 END) AS active_in_progress
    FROM pickup_requests pr
    WHERE pr.collector_id = ?
  `;
  db.get(sql, [collectorId, collectorId], (err, counts) => {
    if (err) return callback(err);

    const earningsSql = `
      SELECT
        COALESCE(SUM(CASE WHEN date(wc.collection_date) = date('now') THEN wc.reward_points ELSE 0 END), 0) AS today_earnings,
        COALESCE(SUM(CASE WHEN date(wc.collection_date) >= date('now', '-6 days') THEN wc.reward_points ELSE 0 END), 0) AS week_earnings,
        COALESCE(SUM(wc.reward_points), 0) AS total_earnings
      FROM waste_collections wc
      WHERE wc.collector_id = ?
    `;

    db.get(earningsSql, [collectorId], (earningsErr, earnings) => {
      if (earningsErr) return callback(earningsErr);

      const weeklySql = `
        SELECT date(wc.collection_date) AS day, COALESCE(SUM(wc.reward_points), 0) AS points
        FROM waste_collections wc
        WHERE wc.collector_id = ? AND date(wc.collection_date) >= date('now', '-6 days')
        GROUP BY date(wc.collection_date)
        ORDER BY day ASC
      `;

      db.all(weeklySql, [collectorId], (weeklyErr, weekly) => {
        if (weeklyErr) return callback(weeklyErr);

        const userSql = `SELECT username, email, level, total_reward_points, profile_image FROM users WHERE id = ?`;
        db.get(userSql, [collectorId], (userErr, user) => {
          if (userErr) return callback(userErr);

          const totalAssigned = (counts?.assigned_count || 0) + (counts?.in_progress_count || 0) + (counts?.completed_count || 0);
          const completionRate = totalAssigned > 0
            ? Math.round(((counts?.completed_count || 0) / totalAssigned) * 100)
            : 0;

          callback(null, {
            ...counts,
            ...earnings,
            weekly_earnings: weekly,
            completion_rate: completionRate,
            user,
          });
        });
      });
    });
  });
};

const getCollectorEarningsHistory = (collectorId, callback) => {
  const sql = `
    SELECT rh.transaction_id, rh.points, rh.source, rh.transaction_type, rh.transaction_date,
           pr.request_code, pr.waste_types
    FROM reward_history rh
    LEFT JOIN pickup_requests pr ON pr.id = (
      SELECT wc.pickup_request_id FROM waste_collections wc
      WHERE wc.collector_id = rh.user_id
        AND wc.reward_points = rh.points
        AND date(wc.collection_date) = date(rh.transaction_date)
      LIMIT 1
    )
    WHERE rh.user_id = ? AND rh.transaction_type = 'credit'
    ORDER BY rh.transaction_date DESC
    LIMIT 50
  `;
  db.all(sql, [collectorId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

module.exports = {
  insertRequest,
  getRequestsByUserId,
  getRequestsByCollectorId,
  getRequestByIdForCollector,
  startRequestByCollector,
  collectRequestByCollector,
  completeRequestByCollector,
  getCollectorStats,
  getCollectorEarningsHistory,
  generateRequestCode,
};
