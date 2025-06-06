const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
} = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Protected routes
router.post('/', verifyToken, checkRole(['admin', 'manager']), createProduct);
router.put('/:id', verifyToken, checkRole(['admin', 'manager']), updateProduct);
router.delete('/:id', verifyToken, checkRole(['admin']), deleteProduct);

module.exports = router; 