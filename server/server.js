const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pickupRoutes = require('./routes/requestRoutes');
const signupRoutes = require('./routes/signupRoutes');
const loginRoutes = require('./routes/loginRoutes');
const profileRoutes = require('./routes/profileRoutes');


const app = express();
const PORT = 5000;


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/', pickupRoutes);
app.use('/', signupRoutes);
app.use('/', loginRoutes);
app.use('/', profileRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});