const { errorResponse } = require('../utils/response');
const { logError } = require('../utils/logger');
const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  logError('Request error', err);

  let statusCode = err.statusCode || 500;
  if (err instanceof multer.MulterError || err.message?.startsWith('Invalid file type')) {
    statusCode = 400;
  }

  return errorResponse(res, err, statusCode);
};

module.exports = errorHandler;
