const db = require("../database");
const sendOrderEmail = require("../utils/orderEmail");

exports.checkout = (req, res) => {
  const { email, items } = req.body;

  if (!email || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid request" });
  }

  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let totalCost = 0;

    const validateStock = items.map(item => new Promise((resolve, reject) => {
      db.get(`SELECT * FROM products WHERE product_id = ?`, [item.product_id], (err, product) => {
        if (err || !product) return reject(`Product not found`);
        if (item.quantity > product.stock_quantity) return reject(`Not enough stock for ${product.product_name}`);
        totalCost += item.quantity * product.price;
        item.product_name = product.product_name; // for email
        resolve(true);
      });
    }));

    Promise.all(validateStock)
      .then(() => {
        if (user.total_reward_points < totalCost) {
          return res.status(400).json({ success: false, message: "Not enough reward points" });
        }

        const now = new Date().toISOString();

        db.run(
          `INSERT INTO orders (user_id, total_points_used, purchase_date)
           VALUES (?, ?, ?)`,
          [user.user_id, totalCost, now],
          function (err) {
            if (err) return res.status(500).json({ success: false, message: "Order insert failed" });

            const orderId = this.lastID;

            items.forEach(item => {
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
              `UPDATE users SET total_reward_points = total_reward_points - ? WHERE user_id = ?`,
              [totalCost, user.user_id]
            );

            db.run(
              `INSERT INTO reward_history (user_id, points, transaction_type, transaction_date)
               VALUES (?, ?, 'redeem', ?)`,
              [user.user_id, totalCost, now]
            );

            sendOrderEmail(email, items, totalCost)
              .then(() => res.json({ success: true }))
              .catch((emailErr) => {
                console.error("Email failed:", emailErr);
                res.json({ success: true, warning: "Email failed to send" });
              });
          }
        );
      })
      .catch(err => {
        console.error(err);
        return res.status(400).json({ success: false, message: err });
      });
  });
};

exports.getOrders = (req, res) => {
  const { email } = req.query;

  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  db.get(`SELECT user_id FROM users WHERE email = ?`, [email], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    db.all(
      `
      SELECT 
        o.order_id, 
        o.total_points_used, 
        o.purchase_date,
        GROUP_CONCAT(p.product_name || '|' || oi.quantity) AS items
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN products p ON oi.product_id = p.product_id
      WHERE o.user_id = ?
      GROUP BY o.order_id
      ORDER BY o.purchase_date DESC
      `,
      [user.user_id],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: "Failed to fetch orders" });
        }

        const formatted = rows.map((order) => ({
          order_id: order.order_id,
          total_points_used: order.total_points_used,
          purchase_date: order.purchase_date,
          items: order.items.split(",").map(i => {
            const [product_name, quantity] = i.split("|");
            return { product_name, quantity: Number(quantity) };
          })
        }));

        res.json({ success: true, orders: formatted });
      }
    );
  });
};
