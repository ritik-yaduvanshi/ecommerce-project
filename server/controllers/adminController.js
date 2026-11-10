// controllers/adminController.js
const db = require("../config/db");

exports.createProduct = async (req, res) => {
  const { category_id, title, description, price, stock_quantity, image_url } =
    req.body;

  if (
    !category_id ||
    !title ||
    price === undefined ||
    stock_quantity === undefined
  ) {
    return res.status(400).json({ message: "Missing required product fields" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO Products (category_id, title, description, price, stock_quantity, image_url) 
             VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        title,
        description || "",
        price,
        stock_quantity,
        image_url || "",
      ],
    );
    res
      .status(201)
      .json({
        message: "Product created successfully",
        product_id: result.insertId,
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  const { category_id, title, description, price, stock_quantity, image_url } =
    req.body;
  const productId = req.params.id;

  try {
    const [existing] = await db.query(
      "SELECT product_id FROM Products WHERE product_id = ?",
      [productId],
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await db.query(
      `UPDATE Products SET category_id = COALESCE(?, category_id), 
                                title = COALESCE(?, title), 
                                description = COALESCE(?, description), 
                                price = COALESCE(?, price), 
                                stock_quantity = COALESCE(?, stock_quantity), 
                                image_url = COALESCE(?, image_url) 
             WHERE product_id = ?`,
      [
        category_id,
        title,
        description,
        price,
        stock_quantity,
        image_url,
        productId,
      ],
    );

    res.json({ message: "Product updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM Products WHERE product_id = ?",
      [req.params.id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { order_status } = req.body;
  const orderId = req.params.id;
  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered"];

  if (!validStatuses.includes(order_status)) {
    return res.status(400).json({ message: "Invalid order status value" });
  }

  try {
    const [result] = await db.query(
      "UPDATE Orders SET order_status = ? WHERE order_id = ?",
      [order_status, orderId],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order status updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
