const { supabase } = require('../services/databaseService');

const unauthorized = (res, message) => res.status(401).json({
  success: false,
  error: { message }
});

// 用户认证中间件
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Access token required');
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return unauthorized(res, 'Invalid or expired token');
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    return unauthorized(res, 'Authentication failed');
  }
};

module.exports = {
  authenticateUser
};
