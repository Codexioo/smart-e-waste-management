const express = require('express');
const router = express.Router();
const {
  getAllPickupRequests,
  updatePickupStatus,
  updatePickupRequest
} = require('../controllers/pickupController');

router.get('/', getAllPickupRequests);
router.put('/:id/status', updatePickupStatus);
router.put('/:id/edit', updatePickupRequest);

module.exports = router;