const express = require('express');
const router = express.Router();
const { getConnectionHealth } = require('../config/database');

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const saleRoutes = require('./saleRoutes');
const categoryRoutes = require('./categoryRoutes');
const userRoutes = require('./userRoutes');

router.get('/health', async (req, res) => {
  try {
    const database = await getConnectionHealth();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database,
      requestId: req.requestId
    });
  } catch (error) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'error',
        message: error.message
      },
      requestId: req.requestId
    });
  }
});

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);

module.exports = router; 
