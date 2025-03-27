const { insertUser } = require('../models/signupModel');
const bcrypt = require('bcryptjs');

const handleSignup = async (req, res) => {
  const { username, email, telephone, address, role, password } = req.body;

  // Basic validation
  if (!username || !email || !telephone || !address || !role || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      username,
      email,
      telephone,
      address,
      role,
      hashedPassword
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
