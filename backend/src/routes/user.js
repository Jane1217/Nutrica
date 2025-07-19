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
router.delete('/delete-account', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.body;
    const authenticatedUser = req.user;
    
    if (!userId) {
      return res.status(400).json({ error: '用户ID是必需的' });
    }

    // 确保用户只能删除自己的账号
    if (userId !== authenticatedUser.id) {
      return res.status(403).json({ error: '只能删除自己的账号' });
    }

    // 1. 首先删除用户相关的数据（级联删除应该自动处理）
    console.log(`开始删除用户 ${userId} 的数据...`);

    // 2. 删除用户的头像文件
    try {
      if (authenticatedUser.user_metadata?.avatarUrl) {
        const urlParts = authenticatedUser.user_metadata.avatarUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName && fileName.startsWith('avatar_')) {
          const { error: avatarError } = await supabase.storage
            .from('avatars')
            .remove([fileName]);
          
          if (avatarError) {
            console.error('删除头像文件失败:', avatarError);
          } else {
            console.log('头像文件已删除:', fileName);
          }
        }
      }
    } catch (error) {
      console.error('删除头像时出错:', error);
    }

    // 3. 使用管理员权限删除用户账号
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('删除用户账号失败:', deleteError);
      return res.status(500).json({ 
        error: '删除用户账号失败', 
        details: deleteError.message 
      });
    }

    console.log(`用户 ${userId} 已成功删除`);
    res.json({ 
      success: true, 
      message: '用户账号已成功删除' 
    });

  } catch (error) {
    console.error('删除用户时出错:', error);
    res.status(500).json({ 
      error: '删除用户时出错', 
      details: error.message 
    });
  }
});

module.exports = router; 