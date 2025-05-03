const db = require('../database');

// Fetch all pickup requests with user details
const getAllPickupRequests = (req, res) => {
  const query = `
    SELECT 
      pr.id,
      pr.request_code,
      pr.create_date,
      pr.district,
      pr.city,
      pr.address,
      pr.status,
      pr.waste_types,
      u.username AS user_name,
      u.email,
      u.telephone
    FROM pickup_requests pr
    JOIN users u ON pr.user_id = u.id
    ORDER BY pr.create_date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('❌ DB error:', err);
      return res.status(500).json({ error: 'Failed to fetch pickup requests' });
    }
    res.json(rows);
  });
};

const updatePickupStatus = (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;

  if (!['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const sql = `UPDATE pickup_requests SET status = ? WHERE id = ?`;
  db.run(sql, [status, requestId], function (err) {
    if (err) {
      console.error('❌ Status update error:', err);
      return res.status(500).json({ error: 'Failed to update request status' });
    }
    res.json({ success: true, message: 'Status updated successfully' });
  });
};

const updatePickupRequest = (req, res) => {
  const requestId = req.params.id;
  const { address, district, city, waste_types } = req.body;

  if (!address || !district || !city || !waste_types) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = `
    UPDATE pickup_requests
    SET address = ?, district = ?, city = ?, waste_types = ?
    WHERE id = ?
  `;

  db.run(sql, [address, district, city, waste_types, requestId], function (err) {
    if (err) {
      console.error('❌ Edit request error:', err);
      return res.status(500).json({ error: 'Failed to update pickup request' });
    }

    res.json({ success: true, message: 'Pickup request updated successfully' });
  });
};

module.exports = {
  getAllPickupRequests,
  updatePickupStatus,
  updatePickupRequest
};