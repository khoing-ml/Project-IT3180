const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');

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

module.exports = router;
