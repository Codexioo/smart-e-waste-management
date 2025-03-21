const db = require('../database/database');

const insertRequest = (data, callback) => {
  const { location, address, district, city } = data;
  const sql = `
    INSERT INTO pickup_requests (location, address, district, city)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [location, address, district, city], function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, { id: this.lastID, ...data });
  });
};

module.exports = { insertRequest };