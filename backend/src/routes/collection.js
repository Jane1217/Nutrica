const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const databaseService = require('../services/databaseService');

// 获取collection_puzzles数据
router.get('/collection-puzzles', async (req, res) => {
  try {
    const data = await databaseService.getCollectionPuzzles();
    
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

    const data = await databaseService.getUserCollections(userId, collection_type);

    console.log('User collections query result:', { data, userId, collection_type });

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

    const result = await databaseService.addUserCollection(userId, {
      collection_type,
      puzzle_name,
      nutrition,
      count
    });

    res.json({
      success: true,
      message: 'Collection processed successfully',
      data: result
    });
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

// 获取公开的collection数据（不需要认证）
router.get('/public-collection', async (req, res) => {
  try {
    const { user_id, puzzle_name } = req.query;

    if (!user_id || !puzzle_name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required parameters: user_id and puzzle_name'
        }
      });
    }

    const { data: collectionData, error } = await supabase
      .from('user_collections')
      .select('nutrition, first_completed_at')
      .eq('user_id', user_id)
      .eq('puzzle_name', puzzle_name)
      .maybeSingle();

    if (error) {
      console.error('Error fetching public collection:', error);
      return res.status(404).json({
        success: false,
        error: {
          message: 'Collection not found',
          details: error.message
        }
      });
    }

    if (!collectionData) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Collection not found'
        }
      });
    }

    res.json({
      success: true,
      data: collectionData
    });
  } catch (error) {
    console.error('Error in public-collection endpoint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      }
    });
  }
});

// 更新CongratulationsModal显示状态
router.post('/update-congratulations-shown', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { puzzle_name, collection_type } = req.body;

    if (!puzzle_name || !collection_type) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields: puzzle_name and collection_type'
        }
      });
    }

    // 插入或更新user_congratulations_shown表
    const { error } = await supabase
      .from('user_congratulations_shown')
      .upsert({
        user_id: userId,
        puzzle_name,
        collection_type,
        shown_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,puzzle_name,collection_type'
      });

    if (error) {
      console.error('Error updating congratulations shown status:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update congratulations shown status',
          details: error.message
        }
      });
    }

    res.json({
      success: true,
      message: 'Congratulations shown status updated successfully'
    });
  } catch (error) {
    console.error('Error in update-congratulations-shown endpoint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        details: error.message
      }
    });
  }
});

// 获取CongratulationsModal显示状态
router.get('/congratulations-shown-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { puzzle_name, collection_type } = req.query;

    if (!puzzle_name || !collection_type) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required parameters: puzzle_name and collection_type'
        }
      });
    }

    // 查询user_congratulations_shown表
    const { data, error } = await supabase
      .from('user_congratulations_shown')
      .select('*')
      .eq('user_id', userId)
      .eq('puzzle_name', puzzle_name)
      .eq('collection_type', collection_type);

    if (error) {
      console.error('Error fetching congratulations shown status:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch congratulations shown status',
          details: error.message
        }
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error in congratulations-shown-status endpoint:', error);
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