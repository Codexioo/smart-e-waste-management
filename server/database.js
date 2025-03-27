const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// 🟢 Ensure table exists with the correct columns
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS pickup_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT NULL,
      address TEXT NOT NULL,
      district TEXT NOT NULL,
      city TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error('❌ Error creating table:', err);
      } else {
        console.log('✅ Table pickup_requests is ready');
      }
    }
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telephone TEXT NOT NULL,
      address TEXT NOT NULL,
      role TEXT CHECK(role IN ('customer', 'collector', 'admin')) NOT NULL,
      password TEXT NOT NULL,
      otp_verified BOOLEAN DEFAULT 0,
      total_reward_points INTEGER DEFAULT 0
    )`,
    (err) => {
      if (err) {
        console.error('❌ Error creating users table:', err);
      } else {
        console.log('✅ Table users is ready');
      }
    }
  );


  // Waste collections
  db.run(`
    CREATE TABLE IF NOT EXISTS waste_collections (
      collection_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      waste_type TEXT,
      waste_weight REAL,
      collection_date TEXT,
      reward_points INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    )`,
    (err) => {
      if (err) {
        console.error('❌ Error creating waste collections table:', err);
      } else {
        console.log('✅ Table waste collections is ready');
      }
    }
  );

  // Reward history
  db.run(`
    CREATE TABLE IF NOT EXISTS reward_history (
      transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      points INTEGER,
      transaction_type TEXT,
      transaction_date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    )`,
    (err) => {
      if (err) {
        console.error('❌ Error creating reward history table:', err);
      } else {
        console.log('✅ Table reward history is ready');
      }
    }
  );

  // Products
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      product_desc TEXT,
      price INTEGER,
      stock_quantity INTEGER
    )`,
    (err) => {
      if (err) {
        console.error('❌ Error creating products table:', err);
      } else {
        console.log('✅ Table products is ready');
      }
    }
  );

  // ✅ Orders table: One row per checkout
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total_points_used INTEGER,
      purchase_date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    )`,
    (err) => {
      if (err) {
        console.error('❌ Error creating Orders table table:', err);
      } else {
        console.log('✅ Table Orders table is ready');
      }
    }
  );

  // ✅ Order items table: One row per item in each order
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      FOREIGN KEY(order_id) REFERENCES orders(order_id),
      FOREIGN KEY(product_id) REFERENCES products(product_id)
    )`,
    (err) => {
      if (err) {
        console.error('❌ Error creating Order items table:', err);
      } else {
        console.log('✅ Table Order items is ready');
      }
    }
  );
  
});

module.exports = db;