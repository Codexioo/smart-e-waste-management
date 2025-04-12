const express = require('express');
const router = express.Router();
const { getAllPickupRequests, updatePickupStatus } = require('../controllers/pickupController');

router.get('/', getAllPickupRequests);
router.put('/:id/status', updatePickupStatus);

module.exports = router;