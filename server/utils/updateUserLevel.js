
const db = require("../database");
const { getLevelFromPoints } = require("./levelHelper");

const updateUserLevel = (userId, newCumulativePoints) => {
  const newLevel = getLevelFromPoints(newCumulativePoints);
  db.run(
    `UPDATE users SET level = ? WHERE id = ?`,
    [newLevel, userId],
    (err) => {
      if (err) {
        console.error("❌ Failed to update user level:", err);
      } else {
        console.log(`✅ User level updated to ${newLevel}`);
      }
    }
  );
};

module.exports = updateUserLevel;
