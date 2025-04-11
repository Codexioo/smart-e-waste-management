const db = require("../database");

// GET /cart
const getCart = (req, res) => {
  const userId = req.user.id;

  db.all(`
    SELECT c.product_id, p.product_name, p.price, c.quantity
    FROM carts c
    JOIN products p ON c.product_id = p.product_id
    WHERE c.user_id = ?
  `, [userId], (err, rows) => {
    if (err) {
      console.error("❌ Failed to fetch cart:", err);
      return res.status(500).json({ error: "Failed to fetch cart" });
    }
    res.json({ success: true, cart: rows });
  });
};

// POST /cart
const addToCart = (req, res) => {
  const user_id = req.user.id;
  const { product_id, quantity } = req.body;

  if (!product_id || quantity == null) {
    return res.status(400).json({ error: "Missing product_id or quantity" });
  }

  db.run(`
    INSERT INTO carts (user_id, product_id, quantity)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, product_id)
    DO UPDATE SET quantity = excluded.quantity
  `, [user_id, product_id, quantity], (err) => {
    if (err) {
      console.error("❌ Failed to update cart:", err);
      return res.status(500).json({ error: "Failed to update cart" });
    }
    res.json({ success: true, message: "Cart updated" });
  });
};

// DELETE /cart/:productId
const removeFromCart = (req, res) => {
  const user_id = req.user.id;
  const { productId } = req.params;

  db.run(`DELETE FROM carts WHERE user_id = ? AND product_id = ?`,
    [user_id, productId], (err) => {
      if (err) {
        console.error("❌ Failed to remove item:", err);
        return res.status(500).json({ error: "Failed to remove item" });
      }
      res.json({ success: true, message: "Item removed" });
    });
};

// DELETE /cart
const clearCart = (req, res) => {
  const user_id = req.user.id;

  db.run(`DELETE FROM carts WHERE user_id = ?`, [user_id], (err) => {
    if (err) {
      console.error("❌ Failed to clear cart:", err);
      return res.status(500).json({ error: "Failed to clear cart" });
    }
    res.json({ success: true, message: "Cart cleared" });
  });
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
};
