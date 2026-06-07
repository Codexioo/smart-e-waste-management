const { request } = require('express');
const db = require('../database');

const generateRequestCode = () => {
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit
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
    WHERE pr.collector_id = ? AND pr.status IN ('Assigned', 'completed')
    ORDER BY pr.create_date DESC
  `;
  db.all(sql, [collectorId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
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

module.exports = {
  insertRequest,
  getRequestsByUserId,
  getRequestsByCollectorId,
  completeRequestByCollector,
  generateRequestCode,
};