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
  // Do not leak provider, database, or internal implementation details to a
  // browser on server failures. Client errors remain actionable.
  const message = statusCode >= 500
    ? 'An unexpected error occurred. Please try again later.'
    : (error.message || 'Request could not be completed');

  return res.status(statusCode).json({
    success: false,
    error: {
      message
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
