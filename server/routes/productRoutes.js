// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.listProducts);
router.get("/categories", productController.listCategories);
router.get("/:id", productController.getProductById);

module.exports = router;
