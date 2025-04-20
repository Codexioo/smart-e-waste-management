const express = require("express");
const router = express.Router();
const { addProduct, getAllProducts, updateProduct, deleteProduct } = require("../controllers/productController");

router.get("/", getAllProducts);
router.post("/", addProduct);
router.put("/", updateProduct); // edit/update product
router.delete("/:id", deleteProduct);

module.exports = router;
