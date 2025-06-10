const { body, param, query } = require('express-validator');

const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('role')
    .optional()
    .isIn(['user', 'seller', 'admin'])
    .withMessage('Invalid role')
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Product name must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock_quantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a positive number'),
  body('category_id')
    .isInt()
    .withMessage('Valid category ID is required'),
  body('image_url')
    .optional()
    .isURL()
    .withMessage('Invalid image URL')
];

const validateProductId = [
  param('id')
    .isInt()
    .withMessage('Invalid product ID')
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive number'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

const validateOrder = [
  body('items')
    .isArray()
    .withMessage('Items must be an array')
    .notEmpty()
    .withMessage('Order must contain at least one item'),
  body('items.*.product_id')
    .isInt()
    .withMessage('Invalid product ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shipping_address')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required'),
  body('payment_method')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
];

const validateOrderStatus = [
  param('id')
    .isInt()
    .withMessage('Invalid order ID'),
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status')
];

const validateCartItem = [
  body('product_id')
    .isInt()
    .withMessage('Invalid product ID'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateProductId,
  validatePagination,
  validateOrder,
  validateOrderStatus,
  validateCartItem
}; 