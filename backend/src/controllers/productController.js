const { randomUUID } = require('crypto');
const { pool } = require('../config/database');

function normalizeBoolean(value, fallback = true) {
  if (value === undefined) {
    return fallback;
  }

  return Boolean(value);
}

async function createProduct(req, res) {
  try {
    const {
      name,
      description = null,
      price,
      stock_quantity = 0,
      category_id = null,
      barcode = null,
      image_url = null,
      is_active = true
    } = req.body;

    if (!name || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({
        message: 'Name, price, and stock quantity are required'
      });
    }

    const productId = randomUUID();
    await pool.query(
      `INSERT INTO products (
        id, name, description, price, stock_quantity,
        category_id, barcode, image_url, is_active, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        name,
        description,
        price,
        stock_quantity,
        category_id,
        barcode,
        image_url,
        normalizeBoolean(is_active),
        req.user.id
      ]
    );

    if (Number(stock_quantity) > 0) {
      await pool.query(
        `INSERT INTO stock_movements (
          id, product_id, quantity, movement_type, reference_type, user_id, notes
        ) VALUES (?, ?, ?, 'in', 'restock', ?, ?)`,
        [randomUUID(), productId, Number(stock_quantity), req.user.id, 'Initial stock']
      );
    }

    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [productId]
    );

    return res.status(201).json(products[0]);
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Unable to create the product' });
  }
}

async function getProducts(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    const categoryId = String(req.query.category_id || '').trim();
    const lowStock = req.query.low_stock === 'true';
    const isActive = req.query.is_active;

    let sql = `
      SELECT p.*, c.name AS category_name, c.color AS category_color
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE 1 = 1
    `;
    const params = [];

    if (q) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.barcode LIKE ?)';
      const pattern = `%${q}%`;
      params.push(pattern, pattern, pattern);
    }

    if (categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    if (lowStock) {
      sql += ' AND p.stock_quantity < 10';
    }

    if (isActive === 'true' || isActive === 'false') {
      sql += ' AND p.is_active = ?';
      params.push(isActive === 'true');
    }

    sql += ' ORDER BY p.updated_at DESC';

    const [products] = await pool.query(sql, params);
    return res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: 'Unable to load products' });
  }
}

async function searchProducts(req, res) {
  return getProducts(req, res);
}

async function getProductById(req, res) {
  try {
    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.color AS category_color
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(products[0]);
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ message: 'Unable to load the product' });
  }
}

async function updateProduct(req, res) {
  try {
    const [products] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [req.params.id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const current = products[0];
    const nextStock = req.body.stock_quantity === undefined
      ? current.stock_quantity
      : Number(req.body.stock_quantity);

    await pool.query(
      `UPDATE products
       SET name = ?, description = ?, price = ?, stock_quantity = ?, category_id = ?,
           barcode = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [
        req.body.name || current.name,
        req.body.description ?? current.description,
        req.body.price ?? current.price,
        nextStock,
        req.body.category_id ?? current.category_id,
        req.body.barcode ?? current.barcode,
        req.body.image_url ?? current.image_url,
        normalizeBoolean(req.body.is_active, current.is_active),
        req.params.id
      ]
    );

    if (nextStock !== current.stock_quantity) {
      const quantityDiff = nextStock - current.stock_quantity;
      await pool.query(
        `INSERT INTO stock_movements (
          id, product_id, quantity, movement_type, reference_type, user_id, notes
        ) VALUES (?, ?, ?, ?, 'adjustment', ?, ?)`,
        [
          randomUUID(),
          req.params.id,
          Math.abs(quantityDiff),
          quantityDiff > 0 ? 'in' : 'out',
          req.user.id,
          'Manual stock adjustment'
        ]
      );
    }

    const [updatedProducts] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.color AS category_color
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ?`,
      [req.params.id]
    );

    return res.json(updatedProducts[0]);
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Unable to update the product' });
  }
}

async function deleteProduct(req, res) {
  try {
    const [products] = await pool.query('SELECT id FROM products WHERE id = ? LIMIT 1', [req.params.id]);

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    return res.status(204).send();
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Unable to delete the product' });
  }
}

module.exports = {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
