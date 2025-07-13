const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// 新增 food 记录
router.post('/', async (req, res) => {
  try {
    const { user_id, name, nutrition, number_of_servings, time } = req.body;
    if (!user_id || !name || !nutrition) {
      return res.status(400).json({ error: '缺少必要字段' });
    }
    const result = await databaseService.insertFood({
      user_id,
      name,
      nutrition,
      number_of_servings,
      time: time || new Date().toISOString()
    });
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router; 