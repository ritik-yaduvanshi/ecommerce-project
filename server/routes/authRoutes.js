// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

router.get("/me", verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
