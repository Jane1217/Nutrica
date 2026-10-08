const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const { validateRequiredFields, cleanNutritionData } = require('../utils/validation');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/response');
const { logApiRequest, logApiResponse, logError } = require('../utils/logger');
const { authenticateUser } = require('../middleware/auth');

// Add new food record
router.post('/', authenticateUser, async (req, res) => {
  try {
    logApiRequest('POST', '/api/food');

    const { name, nutrition, number_of_servings, time, emoji } = req.body;
    const user_id = req.user.id; // 从认证中间件获取用户ID

    // 验证必需字段
    try {
      validateRequiredFields({ name, nutrition }, ['name', 'nutrition']);
    } catch (error) {
      return validationErrorResponse(res, error.message);
    }

    // 清理营养数据
    const cleanNutrition = cleanNutritionData(nutrition);

    const result = await databaseService.insertFood({
      user_id,
      name,
      nutrition: cleanNutrition,
      number_of_servings,
      time: time || new Date().toISOString(),
      emoji: emoji || '🍽️' // 默认emoji
    });

    logApiResponse('POST', '/api/food', 200);
    return successResponse(res, result, 'Food added successfully');
  } catch (error) {
    logError('Food creation failed', error);
    return errorResponse(res, error);
  }
});

module.exports = router;
