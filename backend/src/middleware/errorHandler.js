const { errorResponse } = require('../utils/response');
const { logError } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logError('Request error', err);
  
  // Return different status codes based on error type
  const statusCode = err.statusCode || 500;
  
  return errorResponse(res, err, statusCode);
};

module.exports = errorHandler; 