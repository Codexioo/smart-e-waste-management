const db = require("../database");

exports.getRewards = (req, res) => {
  const user_id = req.user.id;

  db.get(`SELECT total_reward_points FROM users WHERE id = ?`, [user_id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    db.all(
      `SELECT transaction_type, points, transaction_date
       FROM reward_history
       WHERE user_id = ?
       ORDER BY transaction_date DESC`,
      [user_id],
      (err, history) => {
        if (err) {
          return res.status(500).json({ success: false, message: "Failed to fetch history" });
        }

        res.json({
          success: true,
          totalPoints: user.total_reward_points,
          history,
        });
      }
    );
  });
};
