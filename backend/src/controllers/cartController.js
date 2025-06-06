const db = require('../config/database');

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    // Check if product exists and has enough stock
    const [product] = await db.query(
      'SELECT * FROM products WHERE id = ? AND status = "active"',
      [product_id]
    );

    if (!product.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product[0].stock_quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const [existingItem] = await db.query(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (existingItem.length > 0) {
      // Update quantity if item exists
      await db.query(
        'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
        [quantity, user_id, product_id]
      );
    } else {
      // Add new item to cart
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [user_id, product_id, quantity]
      );
    }

    res.status(200).json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
};

// Get cart items
const getCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [cartItems] = await db.query(
      `SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [user_id]
    );

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      items: cartItems,
      total: total
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { product_id } = req.params;
    const user_id = req.user.id;

    // Check if product exists and has enough stock
    const [product] = await db.query(
      'SELECT stock_quantity FROM products WHERE id = ? AND status = "active"',
      [product_id]
    );

    if (!product.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product[0].stock_quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Update cart item
    const [result] = await db.query(
      'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
      [quantity, user_id, product_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Error updating cart item' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user_id = req.user.id;

    const [result] = await db.query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    await db.query('DELETE FROM cart_items WHERE user_id = ?', [user_id]);

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Error clearing cart' });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
}; 