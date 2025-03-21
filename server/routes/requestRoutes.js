const express = require('express');
const router = express.Router();
const { handlePickupRequest } = require('../controllers/requestController');

router.post('/request-pickup', handlePickupRequest);

module.exports = router;