const express = require('express');
const router = express.Router();
const { 
  createProduct, 
  getProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { auth, checkRole } = require('../middleware/auth');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (seller only)
router.post('/', auth, checkRole(['seller', 'admin']), createProduct);
router.put('/:id', auth, checkRole(['seller', 'admin']), updateProduct);
router.delete('/:id', auth, checkRole(['seller', 'admin']), deleteProduct);

module.exports = router; 