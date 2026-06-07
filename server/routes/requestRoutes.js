const express = require('express');
const router = express.Router();
const {
  handlePickupRequest,
  fetchRequestsByUser,
  fetchRequestsByCollector,
  completeCollectorRequest,
} = require('../controllers/requestController');

// Route to handle pickup request submission
router.post('/request-pickup', handlePickupRequest);

// Route to fetch requests by user ID
router.get('/user-requests/:userId', fetchRequestsByUser);

// Collector routes
router.get('/collector-requests/:collectorId', fetchRequestsByCollector);
router.put('/collector-requests/:requestId/complete', completeCollectorRequest);

module.exports = router;