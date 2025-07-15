const express = require('express');
const router = express.Router();
const databaseService = require('../../services/databaseService');
const { validateRequiredFields, cleanNutritionData } = require('../../utils/validation');
const { successResponse, errorResponse, validationErrorResponse } = require('../../utils/response');
const { logApiRequest, logApiResponse, logError } = require('../../utils/logger');

// Add new food record
router.post('/', async (req, res) => {
  try {
    logApiRequest('POST', '/api/food', req.body);
    
    const { user_id, name, nutrition, number_of_servings, time } = req.body;
    
    // 验证必需字段
    try {
      validateRequiredFields({ user_id, name, nutrition }, ['user_id', 'name', 'nutrition']);
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
      time: time || new Date().toISOString()
    });
    
    logApiResponse('POST', '/api/food', 200, result);
    return successResponse(res, result, 'Food added successfully');
  } catch (error) {
    logError('Food creation failed', error);
    return errorResponse(res, error);
  }
});

module.exports = router; 