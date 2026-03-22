const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const helmet = require('helmet');
const path = require('path');
const winston = require('winston');
const { randomUUID } = require('crypto');
const routes = require('./routes');
const { closePool, testConnection } = require('./config/database');

dotenv.config();

const app = express();
const logDirectory = path.join(__dirname, '..', 'logs');
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

fs.mkdirSync(logDirectory, { recursive: true });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(logDirectory, 'combined.log') })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

app.disable('x-powered-by');
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
        return callback(null, origin === 'http://localhost:5173');
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '100kb' }));
app.use(express.urlencoded({
  extended: false,
  limit: process.env.URLENCODED_BODY_LIMIT || '50kb',
  parameterLimit: Number(process.env.URLENCODED_PARAMETER_LIMIT || 50)
}));

app.use((req, res, next) => {
  const startedAt = Date.now();
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);

  logger.info('request_started', {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    query: req.query,
    params: req.params
  });

  res.on('finish', () => {
    logger.info('request_completed', {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    });
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

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Resource not found',
    requestId: req.requestId
  });
});

app.use((err, req, res, next) => {
  logger.error('unhandled_error', {
    requestId: req.requestId,
    message: err.message,
    stack: err.stack
  });

  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
    requestId: req.requestId
  });
});

const PORT = Number(process.env.PORT || 3000);
let server;

async function shutdown(signal) {
  logger.info('shutdown_started', { signal });

  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await closePool();
  logger.info('shutdown_completed', { signal });
}

async function startServer() {
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production');
  }

  await testConnection();

  server = app.listen(PORT, () => {
    logger.info('server_started', {
      port: PORT,
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

startServer().catch((error) => {
  logger.error('startup_error', {
    message: error.message,
    stack: error.stack
  });
  process.exit(1);
});

['SIGINT', 'SIGTERM'].forEach((signal) => {
  process.on(signal, async () => {
    try {
      await shutdown(signal);
      process.exit(0);
    } catch (error) {
      logger.error('shutdown_error', {
        signal,
        message: error.message,
        stack: error.stack
      });
      process.exit(1);
    }
  });
});

module.exports = app;
