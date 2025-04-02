const db = require('../database');

const insertRequest = (data, callback) => {
  const { address, district, city, user_id, waste_types } = data;
  const create_date = new Date().toISOString();
  const status = 'pending'; // Default status on submission
  const wasteStr = waste_types.join(','); // Convert array to comma-separated string

  const sql = `
    INSERT INTO pickup_requests (address, district, city, waste_types, create_date, status, user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [address, district, city, wasteStr, create_date, status, user_id], function (err) {
    if (err) return callback(err);
    callback(null, { id: this.lastID, ...data, status, create_date });
  });
};

const getRequestsByUserId = (userId, callback) => {
  const sql = `SELECT * FROM pickup_requests WHERE user_id = ? ORDER BY id DESC`;
  db.all(sql, [userId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

module.exports = {
  insertRequest,
  getRequestsByUserId,
};