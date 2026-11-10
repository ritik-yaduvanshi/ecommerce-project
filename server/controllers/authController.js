// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Server-side validation
  if (
    !name ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !password ||
    password.length < 8
  ) {
    return res
      .status(400)
      .json({
        message: "Invalid registration data (Password must be 8+ chars)",
      });
  }

  try {
    const [dup] = await db.query("SELECT user_id FROM Users WHERE email = ?", [
      email,
    ]);
    if (dup.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10); // cost factor 10
    const [r] = await db.query(
      "INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hash],
    );
    res
      .status(201)
      .json({ message: "User registered successfully", user_id: r.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM Users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    // Use generic message for unknown email or wrong password to prevent enumeration
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
