const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const databaseService = require('../services/databaseService');
const openaiService = require('../services/openaiService');

router.post('/', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Processing /summary request: ${JSON.stringify(req.body)}`);
  const { date } = req.body || {};

  if (!date) {
    return res.status(400).json({ error: 'Date is required' });
  }

  try {
    const meals = await databaseService.getMealsByDate(date);

    let dailyData = {};
    if (meals.length === 0) {
      return res.json({ summary: '没有今天的数据' });
    }

    dailyData = meals.reduce((acc, meal) => {
      Object.entries(meal.detected_data).forEach(([key, value]) => {
        if (key !== 'error') {
          acc[key] = (acc[key] || 0) + (parseFloat(value) || 0);
        }
      });
      return acc;
    }, {});

    console.time('openai-call');
    const response = await openaiService.generateSummary(date, dailyData);
    console.timeEnd('openai-call');

    const result = response.choices[0].message.content.trim();
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch (e) {
      parsedResult = { summary: 'Failed to parse summary: ' + result };
    }

    await databaseService.insertDailySummary(date, parsedResult.summary, uuidv4());

    res.json(parsedResult);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 总结生成错误: ${error.message}`);
    res.status(500).json({ error: 'Summary generation failed', details: error.message });
  }
});

module.exports = router;