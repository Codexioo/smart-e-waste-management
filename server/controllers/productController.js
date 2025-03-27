const db = require("../database");

exports.getProducts = (req, res) => {
  db.all(`SELECT * FROM products`, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }

    res.json({ success: true, products: rows });
  });
};
