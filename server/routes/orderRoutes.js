const express = require("express");
const router = express.Router();
const { checkout, getOrders } = require("../controllers/orderController");

router.post("/checkout", checkout);
router.get("/orders", getOrders);

module.exports = router;
