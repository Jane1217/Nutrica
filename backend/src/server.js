const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const { performanceMonitor } = require('./middleware/performance');

const app = express();



// Security middleware
app.use(helmet());

// Compression middleware (gzip)
if (config.api.compression) {
  app.use(compression());
}

// CORS middleware
app.use(cors(config.cors));

// Performance monitoring middleware
app.use(performanceMonitor);

// Request body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logger);

// Rate limiting middleware
const limiter = rateLimit(config.api.rateLimit);
app.use(limiter);

// API routes
const routes = require('./routes');
app.use(config.api.prefix, routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Requested resource not found'
    }
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;