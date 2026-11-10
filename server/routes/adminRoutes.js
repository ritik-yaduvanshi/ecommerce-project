// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/auth");

router.use(verifyAdmin); // All admin routes require admin privileges

router.post("/products", adminController.createProduct);
router.put("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);
router.put("/orders/:id/status", adminController.updateOrderStatus);

module.exports = router;
