/**
 * 日志工具函数
 */

// 格式化时间戳
const formatTimestamp = () => {
  return new Date().toISOString();
};

// 信息日志
const logInfo = (message, data = null) => {
  const timestamp = formatTimestamp();
  const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
  console.log(`[${timestamp}] INFO: ${message}${logData}`);
};

// 错误日志
const logError = (message, error = null) => {
  const timestamp = formatTimestamp();
  const errorData = error ? ` | Error: ${error.message || error}` : '';
  console.error(`[${timestamp}] ERROR: ${message}${errorData}`);
  if (error && error.stack) {
    console.error(`[${timestamp}] Stack: ${error.stack}`);
  }
};

// 警告日志
const logWarning = (message, data = null) => {
  const timestamp = formatTimestamp();
  const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
  console.warn(`[${timestamp}] WARN: ${message}${logData}`);
};

// API 请求日志
const logApiRequest = (method, path, data = null) => {
  const timestamp = formatTimestamp();
  const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
  console.log(`[${timestamp}] API ${method.toUpperCase()}: ${path}${logData}`);
};

// API 响应日志
const logApiResponse = (method, path, statusCode, data = null) => {
  const timestamp = formatTimestamp();
  const logData = data ? ` | Data: ${JSON.stringify(data)}` : '';
  console.log(`[${timestamp}] API ${method.toUpperCase()}: ${path} | Status: ${statusCode}${logData}`);
};

module.exports = {
  formatTimestamp,
  logInfo,
  logError,
  logWarning,
  logApiRequest,
  logApiResponse
}; 