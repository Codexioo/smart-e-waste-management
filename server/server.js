const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pickupRoutes = require('./routes/requestRoutes');

const app = express();
const PORT = 9090;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/', pickupRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});