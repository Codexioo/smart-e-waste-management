const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../server/database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite DB', err.message);
  } else {
    console.log('✅ Connected to shared database');
  }
});

db.run(`ALTER TABLE pickup_requests ADD COLUMN collector_id INTEGER REFERENCES users(id)`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error('❌ Error adding collector_id column:', err);
  }
});

module.exports = db;