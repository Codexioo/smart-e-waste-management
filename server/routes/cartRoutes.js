const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require("../controllers/cartController");
const authenticate = require("../middleware/auth");

// These no longer use userId in URL — now it's from req.user.id
router.get("/cart", authenticate, getCart);
router.post("/cart", authenticate, addToCart);
router.delete("/cart/:productId", authenticate, removeFromCart);
router.delete("/cart", authenticate, clearCart);

module.exports = router;
