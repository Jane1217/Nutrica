const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');
const { validateFoodPayload } = require('../utils/validation');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/response');
const { logApiRequest, logApiResponse, logError } = require('../utils/logger');
const { authenticateUser } = require('../middleware/auth');

// Add new food record
router.post('/', authenticateUser, async (req, res) => {
  try {
    logApiRequest('POST', '/api/food');

    const { name, nutrition, number_of_servings, time, emoji } = req.body;
    const user_id = req.user.id; // 从认证中间件获取用户ID

    let food;
    try {
      food = validateFoodPayload({ name, nutrition, number_of_servings, time, emoji });
    } catch (error) {
      return validationErrorResponse(res, error.message);
    }

    const result = await databaseService.insertFood({
      user_id,
      ...food
    });

    logApiResponse('POST', '/api/food', 200);
    return successResponse(res, result, 'Food added successfully');
  } catch (error) {
    logError('Food creation failed', error);
    return errorResponse(res, error);
  }
});

module.exports = router;
