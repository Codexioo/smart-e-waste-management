const db = require('../database');

const insertRequest = (data, callback) => {
  const { location, address, district, city, user_id } = data;
  const sql = `
    INSERT INTO pickup_requests (location, address, district, city, user_id)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.run(sql, [location, address, district, city, user_id], function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, { id: this.lastID, ...data });
  });
};

const getRequestsByUserId = (userId, callback) => {
  const sql = `SELECT * FROM pickup_requests WHERE user_id = ? ORDER BY id DESC`;
  db.all(sql, [userId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
};

// ✅ Export both functions together
module.exports = {
  insertRequest,
  getRequestsByUserId,
};