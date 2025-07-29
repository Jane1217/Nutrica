const performance = require('perf_hooks').performance;

// 性能监控中间件
const performanceMonitor = (req, res, next) => {
  const start = performance.now();
  
  // 监听响应结束事件
  res.on('finish', () => {
    const duration = performance.now() - start;
    const { method, url, statusCode } = req;
    
    // 记录慢查询（超过1秒的请求）
    if (duration > 1000) {
      console.warn(`Slow API request: ${method} ${url} - ${duration.toFixed(2)}ms - Status: ${statusCode}`);
    } else {
      console.log(`API request: ${method} ${url} - ${duration.toFixed(2)}ms - Status: ${statusCode}`);
    }
  });
  
  next();
};

// 数据库查询性能监控
const dbPerformanceMonitor = (operation) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await operation(...args);
      const duration = performance.now() - start;
      
      // 记录慢查询（超过500ms的数据库操作）
      if (duration > 500) {
        console.warn(`Slow DB operation: ${operation.name} - ${duration.toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`DB operation failed: ${operation.name} - ${duration.toFixed(2)}ms - Error: ${error.message}`);
      throw error;
    }
  };
};

module.exports = {
  performanceMonitor,
  dbPerformanceMonitor
}; 