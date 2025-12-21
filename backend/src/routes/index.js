const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const billRoutes = require('./billRoutes');
const vehicleRoutes = require('./vehicleRoute');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'BlueMoon API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
router.use('/users', userRoutes);
router.use('/bills', billRoutes);
router.use('/vehicles', vehicleRoutes);

module.exports = router;
