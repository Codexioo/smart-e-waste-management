const { insertRequest } = require('../models/requestModel');

const handlePickupRequest = (req, res) => {
  const { location, address, district, city } = req.body;

  if (!location || !address || !district || !city) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  insertRequest({ location, address, district, city }, (err, result) => {
    if (err) {
      console.error('❌ DB Insert Error:', err);
      return res.status(500).json({ error: 'Failed to insert request' });
    }
    res.status(201).json({ message: 'Request saved successfully', data: result });
  });
};

module.exports = { handlePickupRequest };