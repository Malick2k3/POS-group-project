const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSaleById,
  getSalesReport
} = require('../controllers/saleController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { validateSaleInput, validateUuidParam } = require('../middleware/validators');

// Protected routes
router.post('/', verifyToken, checkRole(['admin', 'manager', 'cashier']), validateSaleInput, createSale);
router.get('/', verifyToken, checkRole(['admin', 'manager']), getSales);
router.get('/report', verifyToken, checkRole(['admin', 'manager']), getSalesReport);
router.get('/:id', verifyToken, checkRole(['admin', 'manager']), validateUuidParam, getSaleById);

module.exports = router; 
