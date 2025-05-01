const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');

router.get('/dashboard-summary', getDashboardSummary);

module.exports = router;