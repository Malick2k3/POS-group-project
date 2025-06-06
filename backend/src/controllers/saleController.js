const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

const createSale = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { items, payment_method } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Sale items are required' });
    }

    if (!payment_method) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT price, stock_quantity FROM products WHERE id = ?',
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      const product = products[0];
      
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }

      totalAmount += product.price * item.quantity;
    }

    // Create sale record
    const saleId = uuidv4();
    await connection.query(
      `INSERT INTO sales (id, user_id, total_amount, payment_method, status)
       VALUES (?, ?, ?, ?, ?)`,
      [saleId, userId, totalAmount, payment_method, 'completed']
    );

    // Create sale items and update stock
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT price, stock_quantity FROM products WHERE id = ?',
        [item.product_id]
      );
      const product = products[0];

      // Create sale item
      await connection.query(
        `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, total_price)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          saleId,
          item.product_id,
          item.quantity,
          product.price,
          product.price * item.quantity
        ]
      );

      // Update product stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );

      // Record stock movement
      await connection.query(
        `INSERT INTO stock_movements (
          id, product_id, quantity, movement_type,
          reference_type, reference_id, user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          item.product_id,
          item.quantity,
          'out',
          'sale',
          saleId,
          userId,
          'Sale transaction'
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Sale completed successfully',
      sale_id: saleId,
      total_amount: totalAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create sale error:', error);
    res.status(500).json({ message: error.message || 'Internal server error' });
  } finally {
    connection.release();
  }
};

const getSales = async (req, res) => {
  try {
    const { start_date, end_date, user_id } = req.query;
    
    let sql = `
      SELECT s.*, u.username as cashier_name,
             COUNT(si.id) as total_items,
             SUM(si.quantity) as total_quantity
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      sql += ' AND s.created_at >= ?';
      params.push(start_date);
    }

    if (end_date) {
      sql += ' AND s.created_at <= ?';
      params.push(end_date);
    }

    if (user_id) {
      sql += ' AND s.user_id = ?';
      params.push(user_id);
    }

    sql += ' GROUP BY s.id ORDER BY s.created_at DESC';

    const [sales] = await pool.query(sql, params);
    
    res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSaleById = async (req, res) => {
  try {
    const saleId = req.params.id;

    // Get sale details
    const [sales] = await pool.query(`
      SELECT s.*, u.username as cashier_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `, [saleId]);

    if (sales.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Get sale items
    const [items] = await pool.query(`
      SELECT si.*, p.name as product_name, p.barcode
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `, [saleId]);

    res.json({
      ...sales[0],
      items
    });
  } catch (error) {
    console.error('Get sale by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    // Get sales summary
    const [summary] = await pool.query(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(total_amount) as total_revenue,
        COUNT(DISTINCT user_id) as total_cashiers,
        payment_method,
        DATE(created_at) as sale_date
      FROM sales
      WHERE created_at BETWEEN ? AND ?
      GROUP BY DATE(created_at), payment_method
      ORDER BY sale_date DESC, payment_method
    `, [start_date, end_date]);

    // Get top selling products
    const [topProducts] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.barcode,
        SUM(si.quantity) as total_quantity,
        SUM(si.total_price) as total_revenue
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      JOIN sales s ON si.sale_id = s.id
      WHERE s.created_at BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY total_quantity DESC
      LIMIT 10
    `, [start_date, end_date]);

    res.json({
      summary,
      top_products: topProducts
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  getSalesReport
}; 