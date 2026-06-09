const db = require("../database");
const { getLevelFromPoints } = require("../utils/levelHelper");
const updateUserLevel = require("../utils/updateUserLevel");
const sendWasteEmail = require("../utils/wasteEmail");

const submitWaste = (req, res) => {
  const { email, waste_type, waste_weight } = req.body;

  if (!email || !waste_type || !waste_weight) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.get(
    `SELECT id, cumulative_reward_points FROM users WHERE email = ?`,
    [email],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: "User not found" });
      }

      const user_id = user.id;
      const creditedPoints = Math.floor(waste_weight * 10);
      const collectionDate = new Date().toISOString();
      const newCumulative = user.cumulative_reward_points + creditedPoints;

      // ✅ Centralized level update
      updateUserLevel(user_id, newCumulative);

      db.serialize(() => {
        db.run(
          `
        INSERT INTO waste_collections (user_id, waste_type, waste_weight, collection_date, reward_points)
        VALUES (?, ?, ?, ?, ?)`,
          [user_id, waste_type, waste_weight, collectionDate, creditedPoints]
        );

        db.run(
          `
        UPDATE users
        SET total_reward_points = total_reward_points + ?,
            cumulative_reward_points = ?
        WHERE id = ?`,
          [creditedPoints, newCumulative, user_id]
        );

        db.run(
          `
        INSERT INTO reward_history (user_id, points, transaction_type, transaction_date, source)
        VALUES (?, ?, 'credit', ?, ?)`,
          [user_id, creditedPoints, collectionDate, "Recycled Waste"]
        );

        sendWasteEmail(email, creditedPoints, waste_type, waste_weight)
          .then(() => console.log("📧 Waste submission email sent"))
          .catch((err) => console.error("❌ Email sending failed:", err));

        return res.json({
          success: true,
          message: "Waste submitted and points awarded",
          creditedPoints,
          newCumulative,
        });
      });
    }
  );
};

module.exports = { submitWaste };
