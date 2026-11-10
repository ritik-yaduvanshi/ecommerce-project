// routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken); // All order routes require authentication

router.post("/", orderController.createOrder);
router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);

module.exports = router;
