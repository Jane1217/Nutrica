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

// Vercel is a reverse proxy. Trusting its first proxy hop ensures rate limits
// are applied per visitor instead of treating every request as Vercel itself.
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.disable('x-powered-by');

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

// Used by the hosting provider and deployment checks.  This deliberately does
// not depend on Supabase or OpenAI so a cold start can be diagnosed separately
// from an upstream provider outage.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'nutrica-api'
  });
});

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
