const express = require('express');
const router = express.Router();

// Import route modules
const userRoutes = require('./userRoutes');
const visitorRoutes = require('./visitorRoutes');
const accessCardRoutes = require('./accessCardRoutes');

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
router.use('/visitors', visitorRoutes);
router.use('/access-cards', accessCardRoutes);

module.exports = router;
