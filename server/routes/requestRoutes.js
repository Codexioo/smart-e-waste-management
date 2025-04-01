const express = require('express');
const router = express.Router();
const { handlePickupRequest, fetchRequestsByUser } = require('../controllers/requestController');

// Route to handle pickup request submission
router.post('/request-pickup', handlePickupRequest);

// Route to fetch requests by user ID
router.get('/user-requests/:userId', fetchRequestsByUser);

module.exports = router;