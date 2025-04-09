const db = require('../database');

const insertUser = (userData, callback) => {
  const { username, email, telephone, address, role, hashedPassword, create_date, create_time } = userData;

  const sql = `
    INSERT INTO users (username, email, telephone, address, role, password, create_date, create_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [username, email, telephone, address, role, hashedPassword, create_date, create_time],
    function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID, ...userData });
    }
  );
};

module.exports = { insertUser };
