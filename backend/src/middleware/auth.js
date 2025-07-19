const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');

// 创建Supabase客户端（使用服务端密钥）
const supabase = createClient(
  config.database.supabaseUrl,
  config.database.supabaseServiceKey // 使用服务端密钥，有管理员权限
);

// 认证中间件
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '缺少认证令牌' });
    }

    const token = authHeader.substring(7);
    
    // 验证JWT令牌
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

module.exports = { authenticateUser }; 