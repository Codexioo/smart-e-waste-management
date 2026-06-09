const express = require('express');
const router = express.Router();
const db = require('../../server/database'); // ✅ shared database

// 🚀 GET /api/report/pickup-report
router.get('/pickup-report', (req, res) => {
  const pickupQuery = `
    SELECT request_code, address, district, city, waste_types, create_date, status
    FROM pickup_requests
    ORDER BY create_date DESC
  `;

  db.all(pickupQuery, [], (err, rows) => {
    if (err) {
      console.error("❌ Pickup report fetch error:", err);
      return res.status(500).json({ error: "Failed to fetch pickup report" });
    }

    return res.json({ pickupReport: rows });
  });
});

module.exports = router;
