<<<<<<< HEAD
const db = require('../config/database');
=======
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87

// Create a new product
const createProduct = async (req, res) => {
  try {
<<<<<<< HEAD
    const { name, description, price, stock_quantity, category_id, image_url } = req.body;
    const seller_id = req.user.id;

    const [result] = await db.query(
      'INSERT INTO products (seller_id, category_id, name, description, price, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [seller_id, category_id, name, description, price, stock_quantity, image_url]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: {
        id: result.insertId,
        seller_id,
        category_id,
        name,
        description,
        price,
        stock_quantity,
        image_url
      }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product' });
=======
    const { name, description, price, stock_quantity, category_id, barcode, image_url } = req.body;

    // Validate required fields
    if (!name || !price || stock_quantity === undefined) {
      return res.status(400).json({ message: 'Name, price, and stock quantity are required' });
    }

    const productId = uuidv4();
    
    await pool.query(
      `INSERT INTO products (
        id, name, description, price, stock_quantity, 
        category_id, barcode, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [productId, name, description, price, stock_quantity, category_id, barcode, image_url]
    );

    // Record stock movement
    await pool.query(
      `INSERT INTO stock_movements (
        id, product_id, quantity, movement_type, 
        reference_type, user_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuidv4(), productId, stock_quantity, 'in', 'purchase', req.user.id, 'Initial stock']
    );

    res.status(201).json({ message: 'Product created successfully', id: productId });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Internal server error' });
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87
  }
};

// Get all products with pagination
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

<<<<<<< HEAD
    const [products] = await db.query(
=======
    const [products] = await pool.query(
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87
      `SELECT p.*, c.name as category_name, u.username as seller_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN users u ON p.seller_id = u.id 
       WHERE p.status = 'active'
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

<<<<<<< HEAD
    const [total] = await db.query('SELECT COUNT(*) as count FROM products WHERE status = "active"');
=======
    const [total] = await pool.query('SELECT COUNT(*) as count FROM products WHERE status = "active"');
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total[0].count / limit),
        totalItems: total[0].count,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
<<<<<<< HEAD
    res.status(500).json({ message: 'Error fetching products' });
=======
    res.status(500).json({ message: 'Internal server error' });
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
<<<<<<< HEAD
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name, u.username as seller_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN users u ON p.seller_id = u.id 
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get product reviews
    const [reviews] = await db.query(
      `SELECT r.*, u.username 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.product_id = ?`,
      [req.params.id]
    );

    res.json({
      ...products[0],
      reviews
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Error fetching product' });
=======
    const [products] = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(products[0]);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
<<<<<<< HEAD
    const { name, description, price, stock_quantity, category_id, image_url, status } = req.body;
    const productId = req.params.id;

    // Check if product exists and belongs to seller
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND seller_id = ?',
      [productId, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    await db.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, stock_quantity = ?, 
           category_id = ?, image_url = ?, status = ?
       WHERE id = ? AND seller_id = ?`,
      [name, description, price, stock_quantity, category_id, image_url, status, productId, req.user.id]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product' });
=======
    const { name, description, price, stock_quantity, category_id, barcode, image_url } = req.body;
    const productId = req.params.id;

    // Get current product data
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const currentProduct = products[0];

    // Update product
    await pool.query(
      `UPDATE products SET 
        name = ?, description = ?, price = ?, 
        stock_quantity = ?, category_id = ?, 
        barcode = ?, image_url = ?
      WHERE id = ?`,
      [
        name || currentProduct.name,
        description || currentProduct.description,
        price || currentProduct.price,
        stock_quantity || currentProduct.stock_quantity,
        category_id || currentProduct.category_id,
        barcode || currentProduct.barcode,
        image_url || currentProduct.image_url,
        productId
      ]
    );

    // If stock quantity changed, record the movement
    if (stock_quantity !== undefined && stock_quantity !== currentProduct.stock_quantity) {
      const quantityDiff = stock_quantity - currentProduct.stock_quantity;
      const movementType = quantityDiff > 0 ? 'in' : 'out';
      
      await pool.query(
        `INSERT INTO stock_movements (
          id, product_id, quantity, movement_type, 
          reference_type, user_id, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          productId,
          Math.abs(quantityDiff),
          movementType,
          'adjustment',
          req.user.id,
          'Stock adjustment'
        ]
      );
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error' });
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

<<<<<<< HEAD
    // Check if product exists and belongs to seller
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND seller_id = ?',
      [productId, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [productId]);
=======
    // Check if product exists
    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete product
    await pool.query('DELETE FROM products WHERE id = ?', [productId]);
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
<<<<<<< HEAD
    res.status(500).json({ message: 'Error deleting product' });
=======
    res.status(500).json({ message: 'Internal server error' });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { query, category } = req.query;
    
    let sql = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (query) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.barcode LIKE ?)`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      sql += ` AND c.name = ?`;
      params.push(category);
    }

    sql += ` ORDER BY p.name`;

    const [products] = await pool.query(sql, params);
    
    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Internal server error' });
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
<<<<<<< HEAD
  deleteProduct
=======
  deleteProduct,
  searchProducts
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87
}; 