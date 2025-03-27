const db = require("../database");

exports.getRewards = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  db.get(`SELECT total_reward_points, user_id FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    db.all(
      `SELECT transaction_type, points, transaction_date
       FROM reward_history
       WHERE user_id = ?
       ORDER BY transaction_date DESC`,
      [user.user_id],
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
