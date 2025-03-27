const express = require("express");
const router = express.Router();
const { getRewards } = require("../controllers/rewardController");

router.get("/rewards", getRewards);

module.exports = router;
