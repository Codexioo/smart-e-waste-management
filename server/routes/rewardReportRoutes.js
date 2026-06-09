
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Your JWT middleware
const {
  generateRewardSummaryPDF,
  getRewardSummaryData,
} = require("../controllers/rewardReportController");

router.get("/reward-summary", auth, generateRewardSummaryPDF);
router.get("/reward-summary-data", auth, getRewardSummaryData);

module.exports = router;
