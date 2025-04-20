const db = require("../database");
const sendOrderEmail = require("../utils/orderEmail");

exports.checkout = (req, res) => {
  const user_id = req.user.id;
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  db.get(
    `SELECT email, total_reward_points FROM users WHERE id = ?`,
    [user_id],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      let totalCost = 0;

      const validateStock = items.map((item) =>
        new Promise((resolve, reject) => {
          db.get(
            `SELECT * FROM products WHERE product_id = ?`,
            [item.product_id],
            (err, product) => {
              if (err || !product) return reject("Product not found");
              if (item.quantity > product.stock_quantity)
                return reject(`Not enough stock for ${product.product_name}`);
              totalCost += item.quantity * product.price;
              item.product_name = product.product_name;
              item.price = product.price;
              resolve();
            }
          );
        })
      );

      Promise.all(validateStock)
        .then(() => {
          if (user.total_reward_points < totalCost) {
            return res.status(400).json({
              success: false,
              message: "Not enough reward points",
            });
          }

          const now = new Date().toISOString();

          db.run(
            `INSERT INTO orders (user_id, total_points_used, purchase_date)
             VALUES (?, ?, ?)`,
            [user_id, totalCost, now],
            function (err) {
              if (err) {
                return res.status(500).json({ success: false, message: "Order insert failed" });
              }

              const orderId = this.lastID;

              // Generate invoice number
              const dateObj = new Date();
              const formattedDate = dateObj.toISOString().slice(0, 10).replace(/-/g, ""); // yyyyMMdd
              const formattedTime = dateObj.toTimeString().slice(0, 5).replace(":", ""); // HHmm
              const paddedId = String(orderId).padStart(4, "0");
              const invoiceNumber = `${paddedId}${formattedDate}${formattedTime}`;

              // Store invoice number
              db.run(`UPDATE orders SET invoice_number = ? WHERE order_id = ?`, [invoiceNumber, orderId]);

              items.forEach((item) => {
                db.run(
                  `INSERT INTO order_items (order_id, product_id, quantity)
                   VALUES (?, ?, ?)`,
                  [orderId, item.product_id, item.quantity]
                );

                db.run(
                  `UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?`,
                  [item.quantity, item.product_id]
                );
              });

              db.run(
                `UPDATE users SET total_reward_points = total_reward_points - ? WHERE id = ?`,
                [totalCost, user_id]
              );

              db.run(
                `INSERT INTO reward_history (user_id, points, transaction_type, transaction_date, source)
                 VALUES (?, ?, 'redeem', ?, ?)`,
                [user_id, totalCost, now, 'Shop Purchase']
              );

              // Clear cart
              db.run(`DELETE FROM carts WHERE user_id = ?`, [user_id]);

              // Respond immediately
              res.json({ success: true });

              // Send email in background
              sendOrderEmail(user.email, items, totalCost, invoiceNumber)
                .then(() => console.log("📧 Email sent"))
                .catch((emailErr) => console.error("❌ Email failed:", emailErr));
            }
          );
        })
        .catch((err) => {
          console.error("Checkout validation error:", err);
          return res.status(400).json({ success: false, message: err });
        });
    }
  );
};

exports.getOrders = (req, res) => {
  const user_id = req.user.id;

  db.all(
    `SELECT 
      o.order_id, 
      o.invoice_number,
      o.total_points_used, 
      o.purchase_date,
      GROUP_CONCAT(p.product_name || '|' || p.product_image || '|' || oi.quantity) AS items
     FROM orders o
     JOIN order_items oi ON o.order_id = oi.order_id
     JOIN products p ON oi.product_id = p.product_id
     WHERE o.user_id = ?
     GROUP BY o.order_id
     ORDER BY datetime(o.purchase_date) DESC`,
    [user_id],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Failed to fetch orders" });
      }

      const formatted = rows.map(order => ({
        order_id: order.order_id,
        invoice_number: order.invoice_number,
        total_points_used: order.total_points_used,
        purchase_date: order.purchase_date,
        items: order.items.split(",").map(i => {
          const [product_name, product_image, quantity] = i.split("|");
          return {
            product_name,
            product_image,
            quantity: Number(quantity)
          };
        })
      }));

      res.json({ success: true, orders: formatted });
    }
  );
};
