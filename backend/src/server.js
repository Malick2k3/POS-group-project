const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const db = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');

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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/categories', categoryRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DAUST Marketplace API' });
});

// API Documentation route
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    endpoints: {
      auth: {
        login: {
          method: 'POST',
          url: '/api/auth/login',
          body: {
            username: 'string',
            password: 'string'
          }
        },
        register: {
          method: 'POST',
          url: '/api/auth/register',
          body: {
            username: 'string',
            email: 'string',
            password: 'string',
            role: 'admin|manager|cashier'
          }
        },
        me: {
          method: 'GET',
          url: '/api/auth/me',
          headers: {
            Authorization: 'Bearer <token>'
          }
        }
      },
      users: {
        'GET /api/users': 'Get all users (admin only)',
        'GET /api/users/:id': 'Get user by ID (admin only)',
        'POST /api/users': 'Create new user (admin only)',
        'PUT /api/users/:id': 'Update user (admin only)',
        'DELETE /api/users/:id': 'Delete user (admin only)'
      },
      products: {
        'GET /api/products': 'Get all products',
        'GET /api/products/search': 'Search products',
        'GET /api/products/:id': 'Get product by ID',
        'POST /api/products': 'Create new product (admin/manager only)',
        'PUT /api/products/:id': 'Update product (admin/manager only)',
        'DELETE /api/products/:id': 'Delete product (admin only)'
      },
      sales: {
        'POST /api/sales': 'Create new sale (admin/manager/cashier)',
        'GET /api/sales': 'Get all sales (admin/manager)',
        'GET /api/sales/report': 'Get sales report (admin/manager)',
        'GET /api/sales/:id': 'Get sale details (admin/manager)'
      },
      categories: {
        'GET /api/categories': 'Get all categories',
        'POST /api/categories': 'Create category (admin only)',
        'PUT /api/categories/:id': 'Update category (admin only)',
        'DELETE /api/categories/:id': 'Delete category (admin only)'
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