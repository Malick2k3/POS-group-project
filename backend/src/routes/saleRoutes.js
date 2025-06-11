const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSaleById,
  getSalesReport
} = require('../controllers/saleController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Protected routes
router.post('/', verifyToken, checkRole(['admin', 'manager', 'cashier']), createSale);
router.get('/', verifyToken, checkRole(['admin', 'manager']), getSales);
router.get('/report', verifyToken, checkRole(['admin', 'manager']), getSalesReport);
router.get('/:id', verifyToken, checkRole(['admin', 'manager']), getSaleById);

module.exports = router; 