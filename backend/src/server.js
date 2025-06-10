const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const db = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DAUST Marketplace API' });
});

// API Documentation route
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    endpoints: {
      users: {
        register: {
          method: 'POST',
          url: '/api/users/register',
          body: {
            username: 'string',
            email: 'string',
            password: 'string',
            full_name: 'string',
            role: 'user|seller|admin'
          }
        },
        login: {
          method: 'POST',
          url: '/api/users/login',
          body: {
            email: 'string',
            password: 'string'
          }
        },
        profile: {
          method: 'GET',
          url: '/api/users/profile',
          headers: {
            Authorization: 'Bearer <token>'
          }
        }
      },
      products: {
        'GET /api/products': 'Get all products',
        'GET /api/products/:id': 'Get product by ID',
        'POST /api/products': 'Create new product (requires seller auth)',
        'PUT /api/products/:id': 'Update product (requires seller auth)',
        'DELETE /api/products/:id': 'Delete product (requires seller auth)'
      },
      orders: {
        'POST /api/orders': 'Create new order (requires auth)',
        'GET /api/orders/my-orders': 'Get user orders (requires auth)',
        'GET /api/orders/:id': 'Get order details (requires auth)',
        'PATCH /api/orders/:id/status': 'Update order status (requires seller/admin auth)'
      },
      cart: {
        'POST /api/cart/add': 'Add item to cart (requires auth)',
        'GET /api/cart': 'Get cart items (requires auth)',
        'PUT /api/cart/items/:product_id': 'Update cart item quantity (requires auth)',
        'DELETE /api/cart/items/:product_id': 'Remove item from cart (requires auth)',
        'DELETE /api/cart/clear': 'Clear cart (requires auth)'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}); 