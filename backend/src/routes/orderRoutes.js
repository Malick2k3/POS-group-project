const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderDetails, 
  updateOrderStatus 
} = require('../controllers/orderController');
const { auth, checkRole } = require('../middleware/auth');
const { validateOrder, validateOrderStatus } = require('../middleware/validators');

// Protected routes (authenticated users)
router.post('/', auth, validateOrder, createOrder);
router.get('/my-orders', auth, getUserOrders);
router.get('/:id', auth, getOrderDetails);

// Protected routes (admin/seller only)
router.patch('/:id/status', auth, checkRole(['admin', 'seller']), validateOrderStatus, updateOrderStatus);

module.exports = router; 