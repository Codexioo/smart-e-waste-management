const express = require('express');
const db = require('../database');
const authenticate = require('../middleware/auth'); // ✅ shared auth middleware

const router = express.Router();

// 🧾 GET /profile
router.get('/profile', authenticate, (req, res) => {
  const userId = req.user.id;

  db.get(
    `SELECT * FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// 🔄 PUT /profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, telephone, address, email, profile_image } = req.body;

    if (!username || !telephone || !address) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const sql = `
      UPDATE users
      SET username = ?, telephone = ?, address = ?, email = ?, profile_image = ?
      WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      db.run(
        sql,
        [username, telephone, address, email, profile_image || null, userId],
        function (err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });

    return res.json({ message: "Profile updated successfully" });

  } catch (err) {
    console.error("PUT /profile error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


// ❌ DELETE /profile
router.delete('/profile', authenticate, (req, res) => {
  const userId = req.user.id;

  db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to delete account" });
    }
    res.json({ message: "Account deleted successfully" });
  });
});

module.exports = router;
