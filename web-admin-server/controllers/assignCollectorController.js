const db = require('../database');

const getAcceptedPickupRequests = (req, res) => {
  const sql = `
    SELECT pr.*, u.username AS customer_name
    FROM pickup_requests pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.status = 'accepted'
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const getCollectors = (req, res) => {
  db.all("SELECT id, username FROM users WHERE role = 'collector'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

const assignCollector = (req, res) => {
  const { requestId, collectorId } = req.body;

  if (!requestId || !collectorId) {
    return res.status(400).json({ error: 'Missing requestId or collectorId' });
  }

  const sql = `UPDATE pickup_requests SET collector_id = ?, status = 'Assigned' WHERE id = ?`;

  db.run(sql, [collectorId, requestId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Collector assigned successfully' });
  });
};

module.exports = { getAcceptedPickupRequests, getCollectors, assignCollector };