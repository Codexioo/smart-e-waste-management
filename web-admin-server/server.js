const express = require('express');
const cors = require('cors');
const app = express();
const pickupRoutes = require('./routes/pickupRoutes');
const path = require('path');

// 👇 Load shared database file from app server
const sharedDBPath = path.resolve(__dirname, '../server/database.js');
const db = require(sharedDBPath);

app.use(cors());
app.use(express.json());

// Inject db into routes
app.use('/api/pickups', (req, res, next) => {
  req.db = db;
  next();
}, pickupRoutes);

const PORT = 9091;
app.listen(PORT, () => console.log(`🟢 Web Admin Server running on port ${PORT}`));