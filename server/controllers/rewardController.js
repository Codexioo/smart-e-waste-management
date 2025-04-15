const db = require("../database");

exports.getRewards = (req, res) => {
  const user_id = req.user.id;

  db.get(
    `SELECT total_reward_points, cumulative_reward_points, level 
     FROM users WHERE id = ?`, 
    [user_id], 
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      db.all(
        `SELECT transaction_type, points, transaction_date, source
         FROM reward_history
         WHERE user_id = ?
         ORDER BY transaction_date DESC`,
        [user_id],
        (err, history) => {
          if (err) {
            return res.status(500).json({ success: false, message: "Failed to fetch history" });
          }

          const formatted = history.map(h => ({
            transaction_type: h.transaction_type,
            points: h.points,
            transaction_date: h.transaction_date,
            source: h.source || "N/A",
          }));
          
          res.json({
            success: true,
            totalPoints: user.total_reward_points,
            cumulativePoints: user.cumulative_reward_points,
            level: user.level,
            history: formatted,
          });
          
        }
      );
    }
  );
};
