const db = require('../database'); // Adjusted to point to app DB

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

// for status update
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

module.exports = { getAllPickupRequests, updatePickupStatus };