const { insertRequest, getRequestsByUserId } = require('../models/requestModel');

// Handle a new pickup request
const handlePickupRequest = (req, res) => {
  const { location, address, district, city, user_id } = req.body;

  if (!location || !address || !district || !city || !user_id) {
    return res.status(400).json({ error: 'All fields are required including user_id' });
  }

  insertRequest({ location, address, district, city, user_id }, (err, result) => {
    if (err) {
      console.error('❌ DB Insert Error:', err);
      return res.status(500).json({ error: 'Failed to insert request' });
    }
    res.status(201).json({ message: 'Request saved successfully', data: result });
  });
};

// Fetch all pickup requests for a specific user
const fetchRequestsByUser = (req, res) => {
  const userId = req.params.userId;

  getRequestsByUserId(userId, (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, data: requests });
  });
};

// ✅ Export both at once
module.exports = {
  handlePickupRequest,
  fetchRequestsByUser,
};