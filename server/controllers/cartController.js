// controllers/cartController.js
const db = require("../config/db");

// Helper to get or create cart for a user
async function getOrCreateCart(userId) {
  let [carts] = await db.query("SELECT cart_id FROM Carts WHERE user_id = ?", [
    userId,
  ]);
  if (carts.length > 0) return carts[0].cart_id;

  const [res] = await db.query("INSERT INTO Carts (user_id) VALUES (?)", [
    userId,
  ]);
  return res.insertId;
}

exports.getCart = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.user_id);
    const [items] = await db.query(
      `SELECT ci.cart_item_id, ci.product_id, ci.quantity, p.title, p.price, p.image_url, p.stock_quantity 
             FROM Cart_Items ci 
             JOIN Products p ON ci.product_id = p.product_id 
             WHERE ci.cart_id = ?`,
      [cartId],
    );
    res.json({ cart_id: cartId, items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product or quantity" });
  }

  try {
    const cartId = await getOrCreateCart(req.user.user_id);

    // Check product stock
    const [prod] = await db.query(
      "SELECT stock_quantity FROM Products WHERE product_id = ?",
      [product_id],
    );
    if (prod.length === 0 || prod[0].stock_quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    // Upsert cart item
    const [existing] = await db.query(
      "SELECT cart_item_id, quantity FROM Cart_Items WHERE cart_id = ? AND product_id = ?",
      [cartId, product_id],
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + Number(quantity);
      if (prod[0].stock_quantity < newQty) {
        return res
          .status(400)
          .json({ message: "Requested quantity exceeds available stock" });
      }
      await db.query(
        "UPDATE Cart_Items SET quantity = ? WHERE cart_item_id = ?",
        [newQty, existing[0].cart_item_id],
      );
    } else {
      await db.query(
        "INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
        [cartId, product_id, quantity],
      );
    }

    res.json({ message: "Cart updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const itemId = req.params.itemId;

  if (quantity <= 0) {
    return exports.removeCartItem(req, res);
  }

  try {
    const cartId = await getOrCreateCart(req.user.user_id);
    const [items] = await db.query(
      "SELECT ci.product_id, p.stock_quantity FROM Cart_Items ci JOIN Products p ON ci.product_id = p.product_id WHERE ci.cart_item_id = ? AND ci.cart_id = ?",
      [itemId, cartId],
    );

    if (items.length === 0) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    if (items[0].stock_quantity < quantity) {
      return res.status(400).json({ message: "Insufficient stock available" });
    }

    await db.query(
      "UPDATE Cart_Items SET quantity = ? WHERE cart_item_id = ?",
      [quantity, itemId],
    );
    res.json({ message: "Cart item updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const cartId = await getOrCreateCart(req.user.user_id);
    await db.query(
      "DELETE FROM Cart_Items WHERE cart_item_id = ? AND cart_id = ?",
      [req.params.itemId, cartId],
    );
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
