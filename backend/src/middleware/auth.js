const { supabase } = require('../services/databaseService');

// 用户认证中间件
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '缺少认证令牌' });
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: '无效的认证令牌' });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('认证失败:', error);
    return res.status(401).json({ error: '认证失败' });
  }
};

module.exports = {
  authenticateUser
};
