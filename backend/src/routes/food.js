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

// 获取collection_puzzles数据
router.get('/collection-puzzles', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('collection_puzzles')
      .select('id, collection_type, puzzle_name, slot')
      .order('slot', { ascending: true });

    if (error) {
      console.error('Error fetching collection puzzles:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch collection puzzles',
          details: error.message
        }
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in collection-puzzles endpoint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      }
    });
  }
});

// 获取用户的collections数据
router.get('/user-collections', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { collection_type } = req.query;

    let query = supabase
      .from('user_collections')
      .select('*')
      .eq('user_id', userId);

    if (collection_type) {
      query = query.eq('collection_type', collection_type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user collections:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch user collections',
          details: error.message
        }
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in user-collections endpoint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      }
    });
  }
});

// 添加或更新用户collection
router.post('/user-collections', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { collection_type, puzzle_name, nutrition, count = 1 } = req.body;

    if (!collection_type || !puzzle_name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: collection_type and puzzle_name'
        }
      });
    }

    // 检查是否已存在该collection
    const { data: existingCollection, error: fetchError } = await supabase
      .from('user_collections')
      .select('*')
      .eq('user_id', userId)
      .eq('collection_type', collection_type)
      .eq('puzzle_name', puzzle_name)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing collection:', fetchError);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to check existing collection',
          details: fetchError.message
        }
      });
    }

    const now = new Date().toISOString();

    if (existingCollection) {
      // 更新现有collection
      const { error: updateError } = await supabase
        .from('user_collections')
        .update({
          count: existingCollection.count + count,
          nutrition: nutrition || existingCollection.nutrition,
          updated_at: now
        })
        .eq('user_id', userId)
        .eq('collection_type', collection_type)
        .eq('puzzle_name', puzzle_name);

      if (updateError) {
        console.error('Error updating collection:', updateError);
        return res.status(500).json({
          success: false,
          error: {
            message: 'Failed to update collection',
            details: updateError.message
          }
        });
      }

      res.json({
        success: true,
        message: 'Collection updated successfully',
        data: { count: existingCollection.count + count }
      });
    } else {
      // 创建新collection
      const { error: insertError } = await supabase
        .from('user_collections')
        .insert({
          user_id: userId,
          collection_type,
          puzzle_name,
          nutrition: nutrition || {},
          count,
          first_completed_at: now,
          created_at: now,
          updated_at: now
        });

      if (insertError) {
        console.error('Error creating collection:', insertError);
        return res.status(500).json({
          success: false,
          error: {
            message: 'Failed to create collection',
            details: insertError.message
          }
        });
      }

      res.json({
        success: true,
        message: 'Collection created successfully',
        data: { count }
      });
    }
  } catch (error) {
    console.error('Error in user-collections POST endpoint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      }
    });
  }
});

module.exports = router; 