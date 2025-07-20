const express = require('express');
const router = express.Router();
const { supabase } = require('../services/databaseService');
const { authenticateUser } = require('../middleware/auth');

// 检查指定日期是否有图像
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.user.id;

    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const { data, error } = await supabase
      .from('nutrition_images')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    res.json({ hasImage: !!data });
  } catch (error) {
    console.error('Error checking nutrition image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取用户第一个有图像的日期
router.get('/first', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('nutrition_images')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ firstDate: data?.date || null });
  } catch (error) {
    console.error('Error getting first nutrition image date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取用户所有有图像的日期
router.get('/dates', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('nutrition_images')
      .select('date')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    const dates = data.map(item => item.date);
    res.json({ dates });
  } catch (error) {
    console.error('Error getting nutrition image dates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取指定日期的营养图像数据
router.get('/:date', authenticateUser, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('nutrition_images')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'Nutrition image not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error getting nutrition image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 创建或更新营养图像数据
router.post('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, image_data, completion_percentage, puzzle_type, puzzle_name } = req.body;

    if (!date || !image_data) {
      return res.status(400).json({ error: 'Date and image_data are required' });
    }

    const { data, error } = await supabase
      .from('nutrition_images')
      .upsert({
        user_id: userId,
        date,
        image_data,
        completion_percentage: completion_percentage || 0,
        puzzle_type,
        puzzle_name
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error creating/updating nutrition image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 删除营养图像数据
router.delete('/:date', authenticateUser, async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    const { error } = await supabase
      .from('nutrition_images')
      .delete()
      .eq('user_id', userId)
      .eq('date', date);

    if (error) {
      throw error;
    }

    res.json({ message: 'Nutrition image deleted successfully' });
  } catch (error) {
    console.error('Error deleting nutrition image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 