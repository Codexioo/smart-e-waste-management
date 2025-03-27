const db = require('../database');

const insertUser = (userData, callback) => {
  const { username, email, telephone, address, role, hashedPassword } = userData;

  const sql = `
    INSERT INTO users (username, email, telephone, address, role, password)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [username, email, telephone, address, role, hashedPassword], function (err) {
    if (err) {
      return callback(err);
    }
    callback(null, { id: this.lastID, ...userData });
  });
};

module.exports = { insertUser };
