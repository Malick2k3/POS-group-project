const { body, param, validationResult } = require('express-validator');

const allowedRoles = ['admin', 'manager', 'cashier'];
const allowedPaymentMethods = ['cash', 'credit', 'debit', 'mobile'];

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    return res.status(400).json({
      message: 'Request validation failed',
      errors: result.array().map((error) => ({
        field: error.path,
        message: error.msg
      }))
    });
  }

  return next();
};

const validateUuidParam = [
  param('id').isUUID().withMessage('The resource id must be a valid UUID'),
  validateRequest
];

const validateAuthRegistration = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('pin')
    .matches(/^\d{4}$/)
    .withMessage('PIN must be exactly 4 digits'),
  body('role')
    .optional()
    .isIn(allowedRoles)
    .withMessage('Role must be admin, manager, or cashier'),
  validateRequest
];

const validateAuthLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('pin')
    .matches(/^\d{4}$/)
    .withMessage('PIN must be exactly 4 digits'),
  validateRequest
];

const validateUserInput = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('role')
    .isIn(allowedRoles)
    .withMessage('Role must be admin, manager, or cashier'),
  body('pin')
    .optional({ values: 'falsy' })
    .matches(/^\d{4}$/)
    .withMessage('PIN must be exactly 4 digits'),
  validateRequest
];

const validateProductInput = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Product name must be between 2 and 120 characters'),
  body('description')
    .optional({ nullable: true })
    .isLength({ max: 1000 })
    .withMessage('Description must be under 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be zero or greater'),
  body('stock_quantity')
    .isInt({ min: 0, max: 1000000 })
    .withMessage('Stock quantity must be zero or greater'),
  body('category_id')
    .optional({ nullable: true, values: 'falsy' })
    .isUUID()
    .withMessage('Category id must be a valid UUID'),
  body('barcode')
    .optional({ nullable: true, values: 'falsy' })
    .isLength({ max: 64 })
    .withMessage('Barcode must be 64 characters or fewer'),
  body('image_url')
    .optional({ nullable: true, values: 'falsy' })
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image URL must be a valid http or https URL'),
  validateRequest
];

const validateCategoryInput = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional({ nullable: true })
    .isLength({ max: 500 })
    .withMessage('Description must be under 500 characters'),
  body('color')
    .optional({ values: 'falsy' })
    .matches(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/)
    .withMessage('Color must be a valid hex color'),
  validateRequest
];

const validateSaleInput = [
  body('payment_method')
    .isIn(allowedPaymentMethods)
    .withMessage('Payment method must be cash, credit, debit, or mobile'),
  body('items')
    .isArray({ min: 1, max: 100 })
    .withMessage('Sale must include at least one item'),
  body('items.*.product_id')
    .isUUID()
    .withMessage('Each sale item must reference a valid product id'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Each sale item quantity must be between 1 and 1000'),
  body('customer_name')
    .optional({ nullable: true, values: 'falsy' })
    .isLength({ max: 120 })
    .withMessage('Customer name must be under 120 characters'),
  body('tax')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Tax must be zero or greater'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Discount must be zero or greater'),
  validateRequest
];

module.exports = {
  validateRequest,
  validateUuidParam,
  validateAuthRegistration,
  validateAuthLogin,
  validateUserInput,
  validateProductInput,
  validateCategoryInput,
  validateSaleInput
};
