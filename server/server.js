const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = 9090;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 🟢 POST Route to Handle Pickup Requests
app.post('/request-pickup', (req, res) => {
  const { location, address, district, city } = req.body;

  console.log('🔹 Received Data:', req.body); // ✅ Debugging Log

  if (!location || !address || !district || !city) {
    console.error('❌ Missing fields in request');
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `INSERT INTO pickup_requests (location, address, district, city) VALUES (?, ?, ?, ?)`;
  db.run(sql, [location, address, district, city], function (err) {
    if (err) {
      console.error('❌ Error inserting request:', err);
      return res.status(500).json({ error: 'Failed to insert request' });
    }
    console.log('✅ Successfully inserted request:', { id: this.lastID });
    res.json({ message: '✅ Pickup request submitted successfully', id: this.lastID });
  });
});

// 🟢 GET Route to Fetch Requests
app.get('/requests', (req, res) => {
  const sql = `SELECT * FROM pickup_requests`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});