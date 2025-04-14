const express = require("express");
const router = express.Router();
const { addProduct, getAllProducts, updateProduct } = require("../controllers/productController");

router.get("/", getAllProducts);
router.post("/", addProduct);
router.put("/", updateProduct); // edit/update product

module.exports = router;
