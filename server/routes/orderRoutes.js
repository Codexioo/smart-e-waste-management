const express = require("express");
const router = express.Router();
const { checkout, getOrders } = require("../controllers/orderController");
const authenticate = require("../middleware/auth");

router.post("/checkout", authenticate, checkout);
router.get("/orders", authenticate, getOrders);

module.exports = router;
