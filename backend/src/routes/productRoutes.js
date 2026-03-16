const express = require('express');
const {
  createProduct,
  getProducts,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { validateProductInput, validateUuidParam } = require('../middleware/validators');

const router = express.Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', validateUuidParam, getProductById);

router.post('/', verifyToken, checkRole(['admin', 'manager']), validateProductInput, createProduct);
router.put('/:id', verifyToken, checkRole(['admin', 'manager']), validateUuidParam, validateProductInput, updateProduct);
router.delete('/:id', verifyToken, checkRole(['admin']), validateUuidParam, deleteProduct);

module.exports = router;
