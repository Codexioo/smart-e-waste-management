//sample code

const getAllPickupRequests = (req, res) => {
    const db = req.db;
  
    db.all('SELECT * FROM pickup_requests ORDER BY create_date DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch pickup requests' });
      }
      res.json({ success: true, data: rows });
    });
  };
  
  module.exports = { getAllPickupRequests };