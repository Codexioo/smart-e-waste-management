const express = require('express');
const db = require('../database');
const router = express.Router();

// GET all users
router.get('/', (req, res) => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) {
      console.error('❌ Failed to fetch users:', err);
      return res.status(500).json({ error: 'Failed to retrieve users' });
    }
    res.json(rows);
  });
});

// ✅ PUT /users/:id — Update user
router.put('/:id', (req, res) => {
  const userId = req.params.id;
  const { username, email, telephone, address } = req.body;

  if (!username || !email || !telephone || !address) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `
    UPDATE users
    SET username = ?, email = ?, telephone = ?, address = ?
    WHERE id = ?
  `;

  db.run(query, [username, email, telephone, address, userId], function (err) {
    if (err) {
      console.error('❌ Error updating user:', err);
      return res.status(500).json({ error: 'Failed to update user' });
    }

    res.json({ message: '✅ User updated successfully' });
  });
});

// ✅ DELETE /users/:id — Delete user
router.delete('/:id', (req, res) => {
  const userId = req.params.id;

  const query = `DELETE FROM users WHERE id = ?`;

  db.run(query, [userId], function (err) {
    if (err) {
      console.error('❌ Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    res.json({ message: '✅ User deleted successfully' });
  });
});

module.exports = router;
