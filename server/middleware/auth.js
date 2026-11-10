// middleware/auth.js - JWT Authentication & RBAC Guard
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: Missing Session Token" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload (user_id, email, role) to request
    next();
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Invalid or Expired Session Token" });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Access Denied: Administrative Privilege Required" });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };
