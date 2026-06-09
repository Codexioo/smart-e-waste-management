const express = require("express");
const router = express.Router();
const {
  checkUser,
  sendOtp,
  verifyOtp,
} = require("../controllers/authController");

router.post("/check-user", checkUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router;
