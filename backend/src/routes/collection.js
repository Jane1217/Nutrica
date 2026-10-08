const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const databaseService = require('../services/databaseService');
const {
  normalizeRequiredText,
  validateCollectionPayload,
  validateUuid
} = require('../utils/validation');

const validationError = (res, error) => res.status(400).json({
  success: false,
  error: { message: error.message }
});

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
        message: 'Internal server error'
      }
    });
  }
});

// 获取用户的collections数据
router.get('/user-collections', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const collectionType = req.query.collection_type === undefined
      ? undefined
      : normalizeRequiredText(req.query.collection_type, 'Collection type');

    const data = await databaseService.getUserCollections(userId, collectionType);

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    if (error.message?.includes('Collection type')) {
      return validationError(res, error);
    }
    console.error('Error in user-collections endpoint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error'
      }
    });
  }
});

// 添加或更新用户collection
router.post('/user-collections', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    let collection;
    try {
      collection = validateCollectionPayload(req.body || {});
    } catch (error) {
      return validationError(res, error);
    }

    const result = await databaseService.addUserCollection(userId, collection);

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
        message: 'Internal server error'
      }
    });
  }
});

// 获取公开的collection数据（不需要认证）
router.get('/public-collection', async (req, res) => {
  try {
    let userId;
    let puzzleName;
    try {
      userId = validateUuid(req.query.user_id, 'User ID');
      puzzleName = normalizeRequiredText(req.query.puzzle_name, 'Puzzle name');
    } catch (error) {
      return validationError(res, error);
    }

    // 使用databaseService的方法
    const collectionData = await databaseService.getPublicCollection(userId, puzzleName);

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
        message: 'Internal server error'
      }
    });
  }
});

// 更新CongratulationsModal显示状态
router.post('/update-congratulations-shown', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    let puzzleName;
    let collectionType;
    try {
      puzzleName = normalizeRequiredText(req.body?.puzzle_name, 'Puzzle name');
      collectionType = normalizeRequiredText(req.body?.collection_type, 'Collection type');
    } catch (error) {
      return validationError(res, error);
    }

    // 插入或更新user_congratulations_shown表
    const { error } = await databaseService.supabase
      .from('user_congratulations_shown')
      .upsert({
        user_id: userId,
        puzzle_name: puzzleName,
        collection_type: collectionType,
        shown_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,puzzle_name,collection_type'
      });

    if (error) {
      console.error('Error updating congratulations shown status:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update congratulations shown status'
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
        message: 'Internal server error'
      }
    });
  }
});

// 获取CongratulationsModal显示状态
router.get('/congratulations-shown-status', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    let puzzleName;
    let collectionType;
    try {
      puzzleName = normalizeRequiredText(req.query.puzzle_name, 'Puzzle name');
      collectionType = normalizeRequiredText(req.query.collection_type, 'Collection type');
    } catch (error) {
      return validationError(res, error);
    }

    // 查询user_congratulations_shown表
    const { data, error } = await databaseService.supabase
      .from('user_congratulations_shown')
      .select('*')
      .eq('user_id', userId)
      .eq('puzzle_name', puzzleName)
      .eq('collection_type', collectionType);

    if (error) {
      console.error('Error fetching congratulations shown status:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Failed to fetch congratulations shown status'
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
        message: 'Internal server error'
      }
    });
  }
});

module.exports = router;
