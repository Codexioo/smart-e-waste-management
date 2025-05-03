const express = require('express');
const router = express.Router();
const {
  getAcceptedPickupRequests,
  getCollectors,
  assignCollector
} = require('../controllers/assignCollectorController');

router.get('/accepted-requests', getAcceptedPickupRequests);
router.get('/collectors', getCollectors);
router.post('/assign', assignCollector);

module.exports = router;