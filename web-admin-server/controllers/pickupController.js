const db = require('../database');

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
      u.username AS user_name
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

module.exports = { getAllPickupRequests };