// controllers/orderController.js
const db = require("../config/db");

exports.createOrder = async (req, res) => {
  const { shipping_address } = req.body;
  if (!shipping_address) {
    return res.status(400).json({ message: "Shipping address is required" });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get user cart and items
    const [carts] = await connection.query(
      "SELECT cart_id FROM Carts WHERE user_id = ?",
      [req.user.user_id],
    );
    if (carts.length === 0) {
      await connection.release();
      return res.status(400).json({ message: "Cart is empty" });
    }
    const cartId = carts[0].cart_id;

    const [items] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock_quantity 
             FROM Cart_Items ci 
             JOIN Products p ON ci.product_id = p.product_id 
             WHERE ci.cart_id = ?`,
      [cartId],
    );

    if (items.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Validate stock and calculate total
    let totalAmount = 0;
    for (let item of items) {
      if (item.stock_quantity < item.quantity) {
        await connection.rollback();
        connection.release();
        return res
          .status(400)
          .json({
            message: `Insufficient stock for product ID ${item.product_id}`,
          });
      }
      totalAmount += item.price * item.quantity;
    }

    // 3. Create Order record
    const [orderResult] = await connection.query(
      "INSERT INTO Orders (user_id, total_amount, shipping_address, order_status) VALUES (?, ?, ?, ?)",
      [req.user.user_id, totalAmount, shipping_address, "Pending"],
    );
    const orderId = orderResult.insertId;

    // 4. Insert Order Items & Deduct Stock
    for (let item of items) {
      await connection.query(
        "INSERT INTO Order_Items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price],
      );
      await connection.query(
        "UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?",
        [item.quantity, item.product_id],
      );
    }

    // 5. Clear Cart Items
    await connection.query("DELETE FROM Cart_Items WHERE cart_id = ?", [
      cartId,
    ]);

    await connection.commit();
    connection.release();

    res
      .status(201)
      .json({
        message: "Order placed successfully",
        order_id: orderId,
        total_amount: totalAmount,
      });
  } catch (err) {
    await connection.rollback();
    connection.release();
    res.status(500).json({ message: err.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM Orders WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.user_id],
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      "SELECT * FROM Orders WHERE order_id = ? AND user_id = ?",
      [req.params.id, req.user.user_id],
    );
    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [items] = await db.query(
      `SELECT oi.*, p.title, p.image_url 
             FROM Order_Items oi 
             JOIN Products p ON oi.product_id = p.product_id 
             WHERE oi.order_id = ?`,
      [req.params.id],
    );

    res.json({ order: orders[0], items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
