const express = require('express');
const router = express.Router();
<<<<<<< HEAD
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
=======
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
>>>>>>> d348016b6ae3b3d35b4c44ec557a3e8cca377a87

module.exports = router; 