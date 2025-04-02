const { insertRequest, getRequestsByUserId } = require('../models/requestModel');

// User submits pickup request (status will be 'pending' by default)
const handlePickupRequest = (req, res) => {
  const { address, district, city, user_id, waste_types } = req.body;

  if (!address || !district || !city || !user_id || !waste_types || !waste_types.length) {
    return res.status(400).json({ error: 'All fields are required including waste_types' });
  }

  insertRequest({ address, district, city, user_id, waste_types }, (err, result) => {
    if (err) {
      console.error('❌ DB Insert Error:', err);
      return res.status(500).json({ error: 'Failed to insert request' });
    }
    res.status(201).json({ message: 'Request saved successfully', data: result });
  });
};

const fetchRequestsByUser = (req, res) => {
  const userId = req.params.userId;

  getRequestsByUserId(userId, (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, data: requests });
  });
};

module.exports = {
  handlePickupRequest,
  fetchRequestsByUser,
};