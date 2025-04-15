// routes/adminProfile.js
const express = require('express');
const db = require('../database');
const jwt = require('jsonwebtoken');

const router = express.Router();
const SECRET_KEY = 'your_admin_secret';

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/profile
router.get('/', authenticate, (req, res) => {
  const adminId = req.user.id;

  db.get(
    `SELECT id, username, email, telephone, address, profile_image  FROM users WHERE id = ? AND role = 'admin'`,
    [adminId],
    (err, row) => {
      if (err || !row) {
        return res.status(404).json({ error: 'Admin not found' });
      }
      res.json(row);
    }
  );
});

// PUT /api/profile
router.put('/', authenticate, (req, res) => {
  const { username, telephone, address, email, profile_image  } = req.body;
  const adminId = req.user.id;

  if (!username || !telephone || !address || !email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run(
    `UPDATE users SET username = ?, telephone = ?, address = ?, email = ?, profile_image =? WHERE id = ? AND role = 'admin'`,
    [username, telephone, address, email, profile_image, adminId],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update admin profile' });
      res.json({ message: 'Profile updated' });
    }
  );
});

// DELETE /api/profile
router.delete('/', authenticate, (req, res) => {
  const adminId = req.user.id;

  db.run(`DELETE FROM users WHERE id = ? AND role = 'admin'`, [adminId], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete admin account' });
    res.json({ message: 'Admin account deleted' });
  });
});

module.exports = router;
