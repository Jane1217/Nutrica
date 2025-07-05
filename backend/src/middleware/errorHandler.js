const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] 错误: ${err.message}`);
  
  // 根据错误类型返回不同的状态码
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
};

module.exports = errorHandler; 