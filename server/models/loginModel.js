const db = require('../database');

const findUserByEmail = (email, callback) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [email], (err, user) => {
    if (err) {
      return callback(err);
    }
    callback(null, user);
  });
};

module.exports = { findUserByEmail };
