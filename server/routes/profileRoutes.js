const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

const SECRET_KEY = "your_secret_key"; // Same as in login/signup

// 🛡️ Auth middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// 🧾 GET /profile
router.get('/profile', authenticate, (req, res) => {
  const userId = req.user.id;

  db.get(
    `SELECT id, username, email, telephone, address, role, profile_image FROM users WHERE id = ?`,
    [userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    }
  );
});

// 🔄 Update Profile Info
router.put('/profile', authenticate, (req, res) => {
  const userId = req.user.id;
  const { username, telephone, address, profile_image } = req.body;

  if (!username || !telephone || !address) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql = `
    UPDATE users
    SET username = ?, telephone = ?, address = ?, profile_image = ?
    WHERE id = ?
  `;

  db.run(sql, [username, telephone, address, profile_image || null, userId], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    return res.json({ message: "Profile updated successfully" });
  });
});

//  Delete Profile account
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
