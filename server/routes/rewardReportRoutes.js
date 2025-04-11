const express = require('express');
const { generateRewardSummaryPDF } = require('../controllers/rewardReportController');
const authenticate = require('../middleware/auth'); 

const router = express.Router();

router.get('/reward-summary', authenticate, generateRewardSummaryPDF);

module.exports = router;
