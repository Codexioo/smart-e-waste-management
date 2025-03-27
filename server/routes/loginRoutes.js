const express = require('express');
const router = express.Router();
const { handleLogin } = require('../controllers/loginController');

router.post('/login', handleLogin);

module.exports = router;
