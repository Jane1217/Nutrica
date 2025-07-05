const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// 查询（支持按用户和时间范围）
router.get('/', async (req, res) => {
  const { user_id, from, to } = req.query;
  try {
    const meals = await databaseService.getMealsByRange(user_id, from, to);
    res.json(meals);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 新增
router.post('/', async (req, res) => {
  const { user_id, name, nutrition, time, serving } = req.body;
  try {
    await databaseService.insertMeal({ user_id, name, nutrition, time, serving });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 删除
router.delete('/:id', async (req, res) => {
  try {
    await databaseService.deleteMeal(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 更新
router.put('/:id', async (req, res) => {
  const { name, nutrition, time, serving } = req.body;
  try {
    await databaseService.updateMeal(req.params.id, { name, nutrition, time, serving });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
