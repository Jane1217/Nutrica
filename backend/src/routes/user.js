const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/config');
const { authenticateUser } = require('../middleware/auth');

// 创建Supabase客户端（使用服务端密钥）
const supabase = createClient(
  config.database.supabaseUrl,
  config.database.supabaseServiceKey // 使用服务端密钥，有管理员权限
);

// 删除用户账号
router.delete('/account', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`Starting to delete user ${userId} data...`);
    
    // 删除用户账号
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Failed to delete user account:', deleteError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to delete account' 
      });
    }
    
    console.log(`User ${userId} deleted successfully`);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

module.exports = router; 