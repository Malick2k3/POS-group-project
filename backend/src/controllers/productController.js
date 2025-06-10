const db = require('../config/database');

// Create a new product
const createProduct = async (req, res) => {
  try {
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
  }
};

// Get all products with pagination
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [products] = await db.query(
      `SELECT p.*, c.name as category_name, u.username as seller_name 
       FROM products p 
       JOIN categories c ON p.category_id = c.id 
       JOIN users u ON p.seller_id = u.id 
       WHERE p.status = 'active'
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [total] = await db.query('SELECT COUNT(*) as count FROM products WHERE status = "active"');

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
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
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
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
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
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists and belongs to seller
    const [products] = await db.query(
      'SELECT * FROM products WHERE id = ? AND seller_id = ?',
      [productId, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [productId]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
}; 