const { insertUser } = require('../models/signupModel');
const bcrypt = require('bcryptjs');

const handleSignup = async (req, res) => {
  const { username, email, telephone, address, role, password } = req.body;

  if (!username || !email || !telephone || !address || !role || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();
    const create_date = now.toISOString().split('T')[0];        // YYYY-MM-DD
    const create_time = now.toTimeString().split(' ')[0];        // HH:mm:ss

    const userData = {
      username,
      email,
      telephone,
      address,
      role,
      hashedPassword,
      create_date,
      create_time
    };

    insertUser(userData, (err, result) => {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed: users.email')) {
          return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      res.status(201).json({ message: 'User registered successfully', user: result });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error during signup' });
  }
};


module.exports = { handleSignup };
