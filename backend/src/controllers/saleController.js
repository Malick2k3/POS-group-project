const { randomUUID } = require('crypto');
const { pool } = require('../config/database');

async function createSale(req, res) {
  const connection = await pool.getConnection();

  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const paymentMethod = req.body.payment_method || req.body.paymentMethod;
    const customerName = req.body.customer_name || req.body.customerName || null;

    if (items.length === 0) {
      return res.status(400).json({ message: 'At least one sale item is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    await connection.beginTransaction();

    let subtotal = 0;
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = ? LIMIT 1',
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error(`Product ${item.product_id} was not found`);
      }

      if (products[0].stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${products[0].name}`);
      }

      subtotal += Number(products[0].price) * Number(item.quantity);
    }

    const tax = Number(req.body.tax ?? 0);
    const discount = Number(req.body.discount ?? 0);
    const totalAmount = subtotal + tax - discount;
    const saleId = randomUUID();

    await connection.query(
      `INSERT INTO sales (
        id, cashier_id, customer_name, subtotal, tax, discount, total_amount, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [saleId, req.user.id, customerName, subtotal, tax, discount, totalAmount, paymentMethod]
    );

    for (const item of items) {
      const [products] = await connection.query(
        'SELECT id, price FROM products WHERE id = ? LIMIT 1',
        [item.product_id]
      );

      const product = products[0];
      const quantity = Number(item.quantity);
      const unitPrice = Number(product.price);

      await connection.query(
        `INSERT INTO sale_items (
          id, sale_id, product_id, quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [randomUUID(), saleId, item.product_id, quantity, unitPrice, unitPrice * quantity]
      );

      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [quantity, item.product_id]
      );

      await connection.query(
        `INSERT INTO stock_movements (
          id, product_id, quantity, movement_type, reference_type, reference_id, user_id, notes
        ) VALUES (?, ?, ?, 'out', 'sale', ?, ?, ?)`,
        [randomUUID(), item.product_id, quantity, saleId, req.user.id, 'Sale completed']
      );
    }

    await connection.commit();
    return res.status(201).json({
      id: saleId,
      subtotal,
      tax,
      discount,
      total_amount: totalAmount,
      payment_method: paymentMethod,
      customer_name: customerName
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create sale error:', error);
    return res.status(500).json({ message: error.message || 'Unable to create the sale' });
  } finally {
    connection.release();
  }
}

async function getSales(req, res) {
  try {
    const [sales] = await pool.query(
      `SELECT s.*, u.full_name AS cashier_name
       FROM sales s
       LEFT JOIN users u ON u.id = s.cashier_id
       ORDER BY s.created_at DESC`
    );

    return res.json(sales);
  } catch (error) {
    console.error('Get sales error:', error);
    return res.status(500).json({ message: 'Unable to load sales' });
  }
}

async function getSaleById(req, res) {
  try {
    const [sales] = await pool.query(
      `SELECT s.*, u.full_name AS cashier_name
       FROM sales s
       LEFT JOIN users u ON u.id = s.cashier_id
       WHERE s.id = ?`,
      [req.params.id]
    );

    if (sales.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const [items] = await pool.query(
      `SELECT si.*, p.name AS product_name, p.barcode
       FROM sale_items si
       LEFT JOIN products p ON p.id = si.product_id
       WHERE si.sale_id = ?`,
      [req.params.id]
    );

    return res.json({
      ...sales[0],
      items
    });
  } catch (error) {
    console.error('Get sale error:', error);
    return res.status(500).json({ message: 'Unable to load the sale' });
  }
}

async function getSalesReport(req, res) {
  try {
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const [summary] = await pool.query(
      `SELECT
         DATE(created_at) AS sale_date,
         payment_method,
         COUNT(*) AS total_sales,
         SUM(total_amount) AS total_revenue
       FROM sales
       WHERE created_at BETWEEN ? AND ?
       GROUP BY DATE(created_at), payment_method
       ORDER BY sale_date DESC, payment_method`,
      [startDate, endDate]
    );

    const [topProducts] = await pool.query(
      `SELECT
         p.id,
         p.name,
         p.barcode,
         SUM(si.quantity) AS total_quantity,
         SUM(si.total_price) AS total_revenue
       FROM sale_items si
       JOIN products p ON p.id = si.product_id
       JOIN sales s ON s.id = si.sale_id
       WHERE s.created_at BETWEEN ? AND ?
       GROUP BY p.id, p.name, p.barcode
       ORDER BY total_quantity DESC
       LIMIT 10`,
      [startDate, endDate]
    );

    return res.json({
      summary,
      top_products: topProducts
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    return res.status(500).json({ message: 'Unable to build the sales report' });
  }
}

module.exports = {
  createSale,
  getSales,
  getSaleById,
  getSalesReport
};
