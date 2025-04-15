const db = require("../database");

// Add a new product
const addProduct = (req, res) => {
  const {
    product_name,
    product_desc,
    product_image,
    price,
    stock_quantity,
    min_level_required,
    status,
  } = req.body;

  if (!product_name || !price || !stock_quantity || !product_image) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const query = `
    INSERT INTO products (
      product_name,
      product_desc,
      product_image,
      price,
      stock_quantity,
      min_level_required,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    query,
    [
      product_name,
      product_desc || "",
      product_image,
      price,
      stock_quantity,
      min_level_required || 1,
      status || "Available",
    ],
    function (err) {
      if (err) {
        console.error("DB Insert Error:", err);
        return res.status(500).json({ success: false, message: "Failed to insert product" });
      }
      res.json({ success: true, product_id: this.lastID });
    }
  );
};

// Get all products
const getAllProducts = (req, res) => {
  db.all(`SELECT * FROM products ORDER BY product_id DESC`, [], (err, rows) => {
    if (err) {
      console.error("DB fetch error:", err);
      return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
    res.json({ success: true, products: rows });
  });
};

// Update a product
const updateProduct = (req, res) => {
  const {
    product_id,
    product_name,
    product_desc,
    product_image,
    price,
    stock_quantity,
    min_level_required,
    status,
  } = req.body;

  const query = `
    UPDATE products SET
      product_name = ?,
      product_desc = ?,
      product_image = ?,
      price = ?,
      stock_quantity = ?,
      min_level_required = ?,
      status = ?
    WHERE product_id = ?
  `;

  db.run(
    query,
    [
      product_name,
      product_desc,
      product_image,
      price,
      stock_quantity,
      min_level_required,
      status,
      product_id,
    ],
    function (err) {
      if (err) {
        console.error("Update failed:", err);
        return res.status(500).json({ success: false, message: "Update failed" });
      }
      res.json({ success: true });
    }
  );
};

module.exports = {
  addProduct,
  getAllProducts,
  updateProduct,
};
