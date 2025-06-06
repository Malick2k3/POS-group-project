const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const saleRoutes = require('./saleRoutes');
const categoryRoutes = require('./categoryRoutes');
const userRoutes = require('./userRoutes');

// Health check route
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/sales', saleRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);

module.exports = router; 