// requestController.js
const db = require('../database');
const {
  insertRequest,
  getRequestsByUserId,
  getRequestsByCollectorId,
} = require('../models/requestModel');
const updateUserLevel = require('../utils/updateUserLevel');
const sendWasteEmail = require('../utils/wasteEmail');

const handlePickupRequest = (req, res) => {
  const { address, district, city, user_id, waste_types, latitude, longitude } = req.body;

  if (!address || !district || !city || !user_id || !waste_types || !waste_types.length || !latitude || !longitude) {
    return res.status(400).json({ error: 'All fields are required including waste_types and location' });
  }

  insertRequest({ address, district, city, user_id, waste_types, latitude, longitude }, (err, result) => {
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

const fetchRequestsByCollector = (req, res) => {
  const collectorId = req.params.collectorId;

  getRequestsByCollectorId(collectorId, (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, data: requests });
  });
};

const completeCollectorRequest = (req, res) => {
  const requestId = req.params.requestId;
  const { collectorId, waste_weight } = req.body;

  if (!collectorId) {
    return res.status(400).json({ error: 'collectorId is required' });
  }

  const weight = parseFloat(waste_weight);
  if (!waste_weight || Number.isNaN(weight) || weight <= 0) {
    return res.status(400).json({ error: 'Valid waste weight (kg) is required' });
  }

  const fetchSql = `
    SELECT pr.*, u.email AS customer_email, u.cumulative_reward_points
    FROM pickup_requests pr
    JOIN users u ON pr.user_id = u.id
    WHERE pr.id = ? AND pr.collector_id = ? AND pr.status = 'Assigned'
  `;

  db.get(fetchSql, [requestId, collectorId], (err, pickup) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!pickup) {
      return res.status(404).json({ error: 'Request not found or already completed' });
    }

    const creditedPoints = Math.floor(weight * 10);
    const collectionDate = new Date().toISOString();
    const newCumulative = pickup.cumulative_reward_points + creditedPoints;

    db.serialize(() => {
      db.run(
        `UPDATE pickup_requests SET status = 'completed' WHERE id = ?`,
        [requestId],
        function (updateErr) {
          if (updateErr) {
            return res.status(500).json({ error: 'Failed to complete request' });
          }

          db.run(
            `INSERT INTO waste_collections (user_id, waste_type, waste_weight, collection_date, reward_points)
             VALUES (?, ?, ?, ?, ?)`,
            [pickup.user_id, pickup.waste_types, weight, collectionDate, creditedPoints]
          );

          db.run(
            `UPDATE users
             SET total_reward_points = total_reward_points + ?,
                 cumulative_reward_points = ?
             WHERE id = ?`,
            [creditedPoints, newCumulative, pickup.user_id]
          );

          db.run(
            `INSERT INTO reward_history (user_id, points, transaction_type, transaction_date, source)
             VALUES (?, ?, 'credit', ?, ?)`,
            [pickup.user_id, creditedPoints, collectionDate, 'Pickup Collection']
          );

          updateUserLevel(pickup.user_id, newCumulative);

          sendWasteEmail(pickup.customer_email, creditedPoints, pickup.waste_types, weight)
            .then(() => console.log('📧 Pickup completion email sent'))
            .catch((emailErr) => console.error('❌ Email sending failed:', emailErr));

          res.json({
            success: true,
            message: 'Pickup completed and points awarded',
            creditedPoints,
            waste_weight: weight,
          });
        }
      );
    });
  });
};

module.exports = {
  handlePickupRequest,
  fetchRequestsByUser,
  fetchRequestsByCollector,
  completeCollectorRequest,
};