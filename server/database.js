const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error connecting to SQLite:', err);
  } else {
    console.log('✅ Connected to SQLite database');
  }
});

// 🟢 Create Tables
db.serialize(() => {
  // USERS
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telephone TEXT NOT NULL,
      address TEXT NOT NULL,
      role TEXT CHECK(role IN ('customer', 'collector', 'admin')) NOT NULL,
      password TEXT NOT NULL,
      otp_verified BOOLEAN DEFAULT 0,
      total_reward_points INTEGER DEFAULT 0,
      cumulative_reward_points INTEGER DEFAULT 0,
      level TEXT DEFAULT 'Bronze I',
      create_date TEXT NOT NULL,
      create_time TEXT NOT NULL,
      profile_image TEXT
    )
  `, (err) => {
    if (err) console.error('❌ Error creating users table:', err);
    else console.log('✅ Table users is ready');
  });

// PICKUP REQUESTS
db.run(`
  CREATE TABLE IF NOT EXISTS pickup_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_code TEXT UNIQUE,
    address TEXT NOT NULL,
    district TEXT NOT NULL,
    city TEXT NOT NULL,
    waste_types TEXT NOT NULL,
    create_date TEXT NOT NULL,
    status TEXT CHECK(status IN ('pending', 'accepted', 'rejected', 'Assigned', 'completed')) NOT NULL DEFAULT 'pending',
    latitude REAL,
    longitude REAL,
    user_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`, (err) => {
  if (err) console.error('❌ Error creating pickup_requests table:', err);
  else console.log('✅ Table pickup_requests is ready');
});

  // WASTE COLLECTIONS
  db.run(`
    CREATE TABLE IF NOT EXISTS waste_collections (
      collection_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      waste_type TEXT,
      waste_weight REAL,
      collection_date TEXT,
      reward_points INTEGER,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('❌ Error creating waste_collections table:', err);
    else console.log('✅ Table waste_collections is ready');
  });

  // REWARD HISTORY
  db.run(`
    CREATE TABLE IF NOT EXISTS reward_history (
      transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      points INTEGER,
      source TEXT,
      transaction_type TEXT,
      transaction_date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('❌ Error creating reward_history table:', err);
    else console.log('✅ Table reward_history is ready');
  });

  // PRODUCTS
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      product_id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      product_image TEXT,
      product_desc TEXT,
      price INTEGER,
      stock_quantity INTEGER,
      status TEXT,
      min_level_required TEXT DEFAULT 'Bronze I'
    )
  `, (err) => {
    if (err) console.error('❌ Error creating products table:', err);
    else console.log('✅ Table products is ready');
  });

  // CARTS
  db.run(`
    CREATE TABLE IF NOT EXISTS carts (
      cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      added_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(product_id) REFERENCES products(product_id),
      UNIQUE(user_id, product_id)
    )
  `, (err) => {
    if (err) console.error("❌ Error creating carts table:", err);
    else console.log("✅ Table carts is ready");
  });

  // ORDERS
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      order_id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      invoice_number TEXT,
      total_points_used INTEGER,
      purchase_date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err) console.error('❌ Error creating orders table:', err);
    else console.log('✅ Table orders is ready');
  });

  // ORDER ITEMS
  db.run(`
    CREATE TABLE IF NOT EXISTS order_items (
      order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      FOREIGN KEY(order_id) REFERENCES orders(order_id),
      FOREIGN KEY(product_id) REFERENCES products(product_id)
    )
  `, (err) => {
    if (err) console.error('❌ Error creating order_items table:', err);
    else console.log('✅ Table order_items is ready');
  });
});

module.exports = db;