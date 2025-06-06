const db = require('../config/database');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { items, shipping_address, payment_method } = req.body;
    const user_id = req.user.id;

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Create order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, shipping_address, payment_method, status) VALUES (?, ?, ?, ?)',
        [user_id, shipping_address, payment_method, 'pending']
      );
      const order_id = orderResult.insertId;

      // Create order items and update product stock
      for (const item of items) {
        // Check product availability
        const [product] = await connection.query(
          'SELECT stock_quantity, price FROM products WHERE id = ? AND status = "active"',
          [item.product_id]
        );

        if (!product.length || product[0].stock_quantity < item.quantity) {
          throw new Error('Product not available or insufficient stock');
        }

        // Create order item
        await connection.query(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [order_id, item.product_id, item.quantity, product[0].price]
        );

        // Update product stock
        await connection.query(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      res.status(201).json({
        message: 'Order created successfully',
        order_id
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Error creating order' });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const user_id = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [orders] = await db.query(
      `SELECT o.*, 
              COUNT(oi.id) as total_items,
              SUM(oi.quantity * oi.price) as total_amount
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [user_id, limit, offset]
    );

    const [total] = await db.query(
      'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      [user_id]
    );

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total[0].count / limit),
        totalItems: total[0].count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get order details
const getOrderDetails = async (req, res) => {
  try {
    const order_id = req.params.id;
    const user_id = req.user.id;

    // Get order with items
    const [orders] = await db.query(
      `SELECT o.*, 
              oi.id as item_id, oi.product_id, oi.quantity, oi.price,
              p.name as product_name, p.image_url
       FROM orders o
       JOIN order_items oi ON o.id = oi.order_id
       JOIN products p ON oi.product_id = p.id
       WHERE o.id = ? AND o.user_id = ?`,
      [order_id, user_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Format order data
    const order = {
      id: orders[0].id,
      status: orders[0].status,
      shipping_address: orders[0].shipping_address,
      payment_method: orders[0].payment_method,
      created_at: orders[0].created_at,
      items: orders.map(item => ({
        id: item.item_id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        image_url: item.image_url
      })),
      total_amount: orders.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    };

    res.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
};

// Update order status (admin/seller only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order_id = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if order exists
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [order_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update status
    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, order_id]
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  updateOrderStatus
}; 