// routes/rewardReportRoutes.js
const express = require('express');
const { generateRewardSummaryPDF } = require('../controllers/rewardReportController');
const jwt = require("jsonwebtoken");
const secretKey = "your_secret_key"; // Replace with your actual key or import from config

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // includes user.id
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authenticate;



const router = express.Router();

router.get('/reward-summary', authenticate, generateRewardSummaryPDF);

module.exports = router;
