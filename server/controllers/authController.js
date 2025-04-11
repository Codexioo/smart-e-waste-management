const db = require("../database");
const otpStore = new Map(); // In-memory OTP store
const sendOtpEmail = require("../utils/sendOtp");

exports.checkUser = (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  db.get(
    `SELECT username, total_reward_points FROM users WHERE email = ?`,
    [email],
    (err, user) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      res.json({ success: true, user });
    }
  );
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(email, { otp, createdAt: Date.now() });

  try {
    await sendOtpEmail(email, otp);
    res.json({ success: true, message: "OTP sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
};

exports.verifyOtp = (req, res) => {
  const { email, enteredOtp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ success: false, message: "OTP not found" });

  const isExpired = Date.now() - record.createdAt > 5 * 60 * 1000;
  if (isExpired) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, message: "OTP expired" });
  }

  if (record.otp !== enteredOtp) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  db.run(`UPDATE users SET otp_verified = 1 WHERE email = ?`, [email]);
  otpStore.delete(email);

  return res.json({ success: true, message: "OTP verified!" });
};
