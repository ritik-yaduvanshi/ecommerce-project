// controllers/productController.js
const db = require("../config/db");

exports.listProducts = async (req, res) => {
  const {
    search = "",
    category,
    sort = "newest",
    page = 1,
    limit = 12,
  } = req.query;
  const where = [],
    params = [];

  if (search) {
    where.push("(title LIKE ? OR description LIKE ?)");
    params.push("%" + search + "%", "%" + search + "%");
  }
  if (category) {
    where.push("category_id = ?");
    params.push(Number(category));
  }

  // Whitelist sort options to prevent SQL injection
  const orderBy =
    {
      price_asc: "price ASC",
      price_desc: "price DESC",
      newest: "product_id DESC",
    }[sort] || "product_id DESC";

  const lim = Math.min(Number(limit) || 12, 50);
  const off = (Math.max(Number(page), 1) - 1) * lim;
  const clause = where.length ? "WHERE " + where.join(" AND ") : "";

  try {
    const [rows] = await db.query(
      `SELECT product_id, category_id, title, description, price, stock_quantity, image_url 
             FROM Products ${clause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, lim, off],
    );
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM Products ${clause}`,
      params,
    );

    res.json({
      items: rows,
      total,
      page: Number(page),
      pages: Math.ceil(total / lim),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM Products WHERE product_id = ?",
      [req.params.id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listCategories = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Categories");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
