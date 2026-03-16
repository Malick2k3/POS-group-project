const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const winston = require('winston');
const routes = require('./routes');
const { testConnection } = require('./config/database');

dotenv.config();

const app = express();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
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
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*'
  })
);
app.use(express.json());

app.use((req, res, next) => {
  logger.info('request', {
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    params: req.params
  });
  next();
});

app.get('/', (req, res) => {
  res.json({
    name: 'Modern POS API',
    status: 'ok',
    version: '1.0.0'
  });
});

app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Modern POS API Documentation',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login with email and 4-digit PIN',
        'POST /api/auth/register': 'Register a new POS user',
        'GET /api/auth/me': 'Get the current authenticated user'
      },
      users: {
        'GET /api/users/profile': 'Get the signed-in user profile',
        'GET /api/users': 'List users (admin only)',
        'GET /api/users/:id': 'Get a user by ID (admin only)',
        'POST /api/users': 'Create a user (admin only)',
        'PUT /api/users/:id': 'Update a user (admin only)',
        'DELETE /api/users/:id': 'Delete a user (admin only)'
      },
      products: {
        'GET /api/products': 'List products with filters',
        'GET /api/products/search': 'Search products by text, category, or stock status',
        'GET /api/products/:id': 'Get product details',
        'POST /api/products': 'Create a product (admin or manager)',
        'PUT /api/products/:id': 'Update a product (admin or manager)',
        'DELETE /api/products/:id': 'Delete a product (admin only)'
      },
      categories: {
        'GET /api/categories': 'List categories',
        'POST /api/categories': 'Create a category (admin only)',
        'PUT /api/categories/:id': 'Update a category (admin only)',
        'DELETE /api/categories/:id': 'Delete a category (admin only)'
      },
      sales: {
        'POST /api/sales': 'Create a sale (admin, manager, cashier)',
        'GET /api/sales': 'List sales (admin or manager)',
        'GET /api/sales/report': 'Get sales summary report (admin or manager)',
        'GET /api/sales/:id': 'Get a sale by ID (admin or manager)'
      }
    }
  });
});

app.use('/api', routes);

app.use((err, req, res, next) => {
  logger.error('unhandled_error', {
    message: err.message,
    stack: err.stack
  });

  res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
});

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  await testConnection();

  app.listen(PORT, () => {
    logger.info(`Modern POS API is running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  logger.error('startup_error', {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});

module.exports = app;
