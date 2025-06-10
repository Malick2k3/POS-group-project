const express = require('express');
const router = express.Router();
const { 
  addToCart, 
  getCart, 
  updateCartItem, 
  removeFromCart, 
  clearCart 
} = require('../controllers/cartController');
const { auth } = require('../middleware/auth');
const { validateCartItem } = require('../middleware/validators');

// All cart routes require authentication
router.use(auth);

// Cart routes
router.post('/add', validateCartItem, addToCart);
router.get('/', getCart);
router.put('/items/:product_id', validateCartItem, updateCartItem);
router.delete('/items/:product_id', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router; 