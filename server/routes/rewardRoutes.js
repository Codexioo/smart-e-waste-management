const express = require("express");
const router = express.Router();
const { getRewards } = require("../controllers/rewardController");
const authenticate = require("../middleware/auth");

router.get("/rewards", authenticate, getRewards);

module.exports = router;
