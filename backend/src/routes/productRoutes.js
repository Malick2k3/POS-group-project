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

const router = express.Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

router.post('/', verifyToken, checkRole(['admin', 'manager']), createProduct);
router.put('/:id', verifyToken, checkRole(['admin', 'manager']), updateProduct);
router.delete('/:id', verifyToken, checkRole(['admin']), deleteProduct);

module.exports = router;
