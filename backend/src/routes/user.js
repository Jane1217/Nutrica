const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const databaseService = require('../services/databaseService');
const { errorResponse } = require('../utils/response');

// 获取用户摄像头权限状态
router.get('/camera-permission-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 查询用户摄像头权限状态
    const { data, error } = await databaseService.supabase
      .from('user_camera_permission')
      .select('permission_shown')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116是"没有找到行"的错误
      console.error('Failed to fetch camera permission status:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch camera permission status' 
      });
    }
    
    // 如果没有记录，说明用户还没有看到过权限提示
    const permissionShown = data ? data.permission_shown : false;
    
    res.json({ 
      success: true, 
      data: { permissionShown } 
    });
  } catch (error) {
    console.error('Error fetching camera permission status:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch camera permission status' });
  }
});

// 更新用户摄像头权限状态
router.post('/update-camera-permission', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 使用upsert操作，如果记录不存在则创建，存在则更新
    const { error } = await databaseService.supabase
      .from('user_camera_permission')
      .upsert({
        user_id: userId,
        permission_shown: true,
        shown_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      console.error('Failed to update camera permission status:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update camera permission status' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Camera permission status updated successfully' 
    });
  } catch (error) {
    console.error('Error updating camera permission status:', error);
    res.status(500).json({ success: false, message: 'Failed to update camera permission status' });
  }
});

// 删除用户账号
router.delete('/account', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('Starting authenticated account deletion');
    
    // 1. 先删除用户相关的数据
    const tablesToDelete = [
      'food',
      'user_collections', 
      'daily_home_data',
      'nutrition_goal',
      'user_camera_permission',
      'user_congratulations_shown'
    ];
    
    for (const table of tablesToDelete) {
      const { error: deleteError } = await databaseService.supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error(`Failed to delete account data from ${table}:`, deleteError);
        return errorResponse(res, deleteError);
      }
    }
    
    // 2. 删除用户头像文件
    // 列出用户的所有头像文件
    const { data: files, error: listError } = await databaseService.supabase.storage
      .from('avatars')
      .list('', {
        search: `avatar_${userId}_`
      });

    if (listError) {
      console.error('Failed to list avatar files during account deletion:', listError);
      return errorResponse(res, listError);
    }

    if (files?.length) {
      const fileNames = files.map(file => file.name);
      const { error: avatarDeleteError } = await databaseService.supabase.storage
        .from('avatars')
        .remove(fileNames);

      if (avatarDeleteError) {
        console.error('Failed to delete avatar files:', avatarDeleteError);
        return errorResponse(res, avatarDeleteError);
      }
    }
    
    // 3. 删除用户账号
    const { error: deleteError } = await databaseService.supabase.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Failed to delete user account:', deleteError);
      return errorResponse(res, deleteError);
    }
    
    console.log('Authenticated account deleted successfully');
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return errorResponse(res, error);
  }
});

module.exports = router;
