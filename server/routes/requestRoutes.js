const express = require('express');
const router = express.Router();
const {
  handlePickupRequest,
  fetchRequestsByUser,
  fetchRequestsByCollector,
  fetchCollectorRequestDetail,
  startCollectorRequest,
  collectCollectorRequest,
  completeCollectorRequest,
  fetchCollectorStats,
  fetchCollectorEarnings,
} = require('../controllers/requestController');

// Route to handle pickup request submission
router.post('/request-pickup', handlePickupRequest);

// Route to fetch requests by user ID
router.get('/user-requests/:userId', fetchRequestsByUser);

// Collector routes
router.get('/collector-stats/:collectorId', fetchCollectorStats);
router.get('/collector-earnings/:collectorId', fetchCollectorEarnings);
router.get('/collector-requests/:collectorId', fetchRequestsByCollector);
router.get('/collector-requests/:collectorId/:requestId', fetchCollectorRequestDetail);
router.put('/collector-requests/:requestId/start', startCollectorRequest);
router.put('/collector-requests/:requestId/collect', collectCollectorRequest);
router.put('/collector-requests/:requestId/complete', completeCollectorRequest);

module.exports = router;