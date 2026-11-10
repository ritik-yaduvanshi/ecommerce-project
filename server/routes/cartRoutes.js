// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/auth");

router.use(verifyToken); // All cart routes require authentication

router.get("/", cartController.getCart);
router.post("/", cartController.addToCart);
router.put("/:itemId", cartController.updateCartItem);
router.delete("/:itemId", cartController.removeCartItem);

module.exports = router;
