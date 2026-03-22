const { randomUUID } = require('crypto');
const { pool } = require('../config/database');

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeReportBoundary(value, boundary) {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  const trimmedValue = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return boundary === 'start'
      ? `${trimmedValue} 00:00:00`
      : `${trimmedValue} 23:59:59`;
  }

  return Number.isNaN(Date.parse(trimmedValue)) ? null : trimmedValue;
}

function aggregateSaleItems(items) {
  const itemMap = new Map();

  for (const item of items) {
    const productId = item.product_id;
    const quantity = Number(item.quantity);
    const currentQuantity = itemMap.get(productId) || 0;
    itemMap.set(productId, currentQuantity + quantity);
  }

  return Array.from(itemMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity
  }));
}

async function createSale(req, res) {
  let connection;
  let transactionStarted = false;

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

    connection = await pool.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const aggregatedItems = aggregateSaleItems(items);
    let subtotal = 0;
    const resolvedItems = [];
    for (const item of aggregatedItems) {
      const [products] = await connection.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = ? LIMIT 1 FOR UPDATE',
        [item.productId]
      );

      if (products.length === 0) {
        throw createHttpError(404, `Product ${item.productId} was not found`);
      }

      const product = products[0];
      const quantity = item.quantity;

      if (product.stock_quantity < quantity) {
        throw createHttpError(409, `Insufficient stock for ${product.name}`);
      }

      const unitPrice = Number(product.price);
      subtotal += unitPrice * quantity;
      resolvedItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice
      });
    }

    const tax = Number(req.body.tax ?? 0);
    const discount = Number(req.body.discount ?? 0);
    const totalAmount = subtotal + tax - discount;

    if (totalAmount < 0) {
      throw createHttpError(400, 'Discount cannot exceed the sale total');
    }

    const saleId = randomUUID();

    await connection.query(
      `INSERT INTO sales (
        id, cashier_id, customer_name, subtotal, tax, discount, total_amount, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [saleId, req.user.id, customerName, subtotal, tax, discount, totalAmount, paymentMethod]
    );

    for (const item of resolvedItems) {
      await connection.query(
        `INSERT INTO sale_items (
          id, sale_id, product_id, quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [randomUUID(), saleId, item.productId, item.quantity, item.unitPrice, item.unitPrice * item.quantity]
      );

      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );

      await connection.query(
        `INSERT INTO stock_movements (
          id, product_id, quantity, movement_type, reference_type, reference_id, user_id, notes
        ) VALUES (?, ?, ?, 'out', 'sale', ?, ?, ?)`,
        [randomUUID(), item.productId, item.quantity, saleId, req.user.id, 'Sale completed']
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
    if (connection && transactionStarted) {
      await connection.rollback();
    }

    console.error('Create sale error:', error);
    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : 'Unable to create the sale'
    });
  } finally {
    if (connection) {
      connection.release();
    }
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
    const startDate = normalizeReportBoundary(req.query.start_date, 'start');
    const endDate = normalizeReportBoundary(req.query.end_date, 'end');

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: 'Start date and end date are required in a valid date format'
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before or equal to end date' });
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
