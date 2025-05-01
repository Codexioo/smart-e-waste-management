const db = require('../database');

const getDashboardSummary = (req, res) => {
  let totalUsers = 0;
  let totalPickupRequests = 0;
  let totalRewardPoints = 0;
  let userStats = [];
  let pickupStats = [];

  db.get('SELECT COUNT(*) as count FROM users', (err, row1) => {
    if (err) return res.status(500).json({ error: err.message });
    totalUsers = row1.count;

    db.get('SELECT COUNT(*) as count FROM pickup_requests', (err, row2) => {
      if (err) return res.status(500).json({ error: err.message });
      totalPickupRequests = row2.count;

      db.get('SELECT SUM(total_reward_points) as total FROM users', (err, row3) => {
        if (err) return res.status(500).json({ error: err.message });
        totalRewardPoints = row3.total ?? 0;

        db.all(`
          SELECT strftime('%m', create_date) AS month, COUNT(*) as count
          FROM users
          GROUP BY month ORDER BY month
        `, (err, rows4) => {
          if (err) return res.status(500).json({ error: err.message });
          userStats = rows4;

          db.all(`
            SELECT strftime('%m', create_date) AS month, COUNT(*) as count
            FROM pickup_requests
            GROUP BY month ORDER BY month
          `, (err, rows5) => {
            if (err) return res.status(500).json({ error: err.message });
            pickupStats = rows5;

            res.json({
              totalUsers,
              totalPickupRequests,
              totalRewardPoints,
              userStats,
              pickupStats
            });
          });
        });
      });
    });
  });
};

module.exports = { getDashboardSummary };