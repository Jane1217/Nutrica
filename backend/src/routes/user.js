const express = require('express');
const router = express.Router();
const { supabase } = require('../services/databaseService');
const { authenticateUser } = require('../middleware/auth');

// 删除用户账号
router.delete('/account', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`Starting to delete user ${userId} data...`);
    
    // 1. 先删除用户相关的数据
    const tablesToDelete = [
      'food',
      'user_collections', 
      'daily_home_data',
      'nutrition_goal'
    ];
    
    for (const table of tablesToDelete) {
      try {
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('user_id', userId);
        
        if (deleteError) {
          console.error(`Failed to delete from ${table}:`, deleteError);
        } else {
          console.log(`Successfully deleted user data from ${table}`);
        }
      } catch (error) {
        console.error(`Error deleting from ${table}:`, error);
      }
    }
    
    // 2. 删除用户头像文件
    try {
      // 列出用户的所有头像文件
      const { data: files, error: listError } = await supabase.storage
        .from('avatars')
        .list('', {
          search: `avatar_${userId}_`
        });
      
      if (!listError && files && files.length > 0) {
        const fileNames = files.map(file => file.name);
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(fileNames);
        
        if (deleteError) {
          console.error('Failed to delete avatar files:', deleteError);
        } else {
          console.log(`Successfully deleted ${fileNames.length} avatar files`);
        }
      }
    } catch (error) {
      console.error('Error deleting avatar files:', error);
    }
    
    // 3. 删除用户账号
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