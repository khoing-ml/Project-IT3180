const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', routes);
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/building', require('./routes/buildingRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'BlueMoon Apartment Management API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      maintenance: '/api/maintenance',
      building: '/api/building'
    }
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 BlueMoon Backend Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  console.log(`🔧 Maintenance API at http://localhost:${PORT}/api/maintenance`);
  console.log(`🏢 Building API at http://localhost:${PORT}/api/building`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
