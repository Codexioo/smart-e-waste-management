const express = require('express');
const router = express.Router();
const { getAllPickupRequests } = require('../controllers/pickupController');

router.get('/', getAllPickupRequests);

module.exports = router;