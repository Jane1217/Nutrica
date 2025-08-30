/**
 * 响应工具函数
 */

// 成功响应
const successResponse = (res, data = null, message = 'Success') => {
  return res.json({
    success: true,
    message,
    data
  });
};

// 错误响应
const errorResponse = (res, error, statusCode = 500) => {
  console.error(`[${new Date().toISOString()}] Error:`, error);
  
  return res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal Server Error'
    }
  });
};

// 验证错误响应
const validationErrorResponse = (res, message) => {
  return errorResponse(res, new Error(message), 400);
};

// 文件上传错误响应
const fileUploadErrorResponse = (res, message) => {
  return errorResponse(res, new Error(message), 400);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  fileUploadErrorResponse
}; 