const express = require('express');
const router = express.Router();
const multer = require('multer');
const config = require('../config/config');
const openaiService = require('../services/openaiService');
const { validateFileType, validateFileSize } = require('../utils/validation');
const { successResponse, errorResponse, fileUploadErrorResponse } = require('../utils/response');
const { logInfo, logError } = require('../utils/logger');

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    try {
      validateFileType(file, config.upload.allowedTypes);
      cb(null, true);
    } catch (error) {
      cb(error, false);
    }
  }
});

// Parse food description
router.post('/description', async (req, res) => {
  try {
    logInfo('Processing food description analysis');
    
    const { description } = req.body;
    
    if (!description || typeof description !== 'string') {
      return errorResponse(res, new Error('Description is required and must be a string'));
    }

    // Call OpenAI to analyze description
    logInfo('Calling OpenAI API for description analysis...');
    const response = await openaiService.analyzeDescription(description);
    
    // Parse OpenAI response content
    const content = response.choices[0].message.content;
    logInfo(`OpenAI response: ${content}`);
    
    let nutritionData;
    try {
      // Clean the response and parse JSON
      const cleanResult = content
        .replace(/```json\s*|\s*```/g, '')
        .replace(/^\s*|\s*$/g, '')
        .replace(/[\r\n]+/g, '')
        .replace(/[-\u001F\u007F-\u009F]/g, '')
        .trim();
      
      logInfo(`Cleaned result: ${cleanResult}`);
      nutritionData = JSON.parse(cleanResult);
    } catch (parseError) {
      logError('JSON parse error', parseError);
      return errorResponse(res, new Error('Failed to parse AI response'));
    }

    // 生成emoji
    let emoji = await openaiService.getFoodEmoji(nutritionData.name || description);

    // Format response data to match frontend FoodModal
    const formattedData = {
      name: nutritionData.name || 'Unknown Food',
      calories: nutritionData.calories || 0,
      carbs: nutritionData.carbs || 0,
      fats: nutritionData.fats || 0,
      protein: nutritionData.protein || 0,
      emoji
    };

    logInfo(`Successfully analyzed description: ${formattedData.name}`);
    return successResponse(res, formattedData, 'Description analyzed successfully');

  } catch (error) {
    logError('Description analysis failed', error);
    return errorResponse(res, error);
  }
});

// Parse food image
router.post('/food', upload.single('image'), async (req, res) => {
  try {
    logInfo(`Processing food image upload: ${req.file?.originalname}`);
    
    if (!req.file) {
      return fileUploadErrorResponse(res, 'No image file received');
    }

    // Validate file size
    try {
      validateFileSize(req.file, config.upload.maxFileSize);
    } catch (error) {
      return fileUploadErrorResponse(res, error.message);
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    logInfo(`Image converted to base64, length: ${base64Image.length}`);

    // Call OpenAI to parse image
    logInfo('Calling OpenAI API...');
    const response = await openaiService.analyzeImage(base64Image);
    
    // Parse OpenAI response content
    const content = response.choices[0].message.content;
    logInfo(`OpenAI response: ${content}`);
    
    let nutritionData;
    try {
      // Clean the response and parse JSON
      const cleanResult = content
        .replace(/```json\s*|\s*```/g, '')
        .replace(/^\s*|\s*$/g, '')
        .replace(/[\r\n]+/g, '')
        .replace(/[-\u001F\u007F-\u009F]/g, '')
        .trim();
      
      logInfo(`Cleaned result: ${cleanResult}`);
      nutritionData = JSON.parse(cleanResult);
    } catch (parseError) {
      logError('JSON parse error', parseError);
      return errorResponse(res, new Error('Failed to parse AI response'));
    }

    // If AI cannot recognize
    if (nutritionData.error) {
      return errorResponse(res, new Error(nutritionData.error), 400);
    }

    // 生成emoji
    let emoji = await openaiService.getFoodEmoji(nutritionData.name || '');

    // Format response data to match frontend FoodModal
    const formattedData = {
      name: nutritionData.name || 'Unknown Food',
      nutrition: {
        calories: nutritionData.calories || nutritionData.Calories || 0,
        carbs: nutritionData.carbs || nutritionData.Carbs || 0,
        fats: nutritionData.fats || nutritionData.Fats || 0,
        protein: nutritionData.protein || nutritionData.Protein || 0
      },
      number_of_servings: 1,
      emoji
    };

    logInfo(`Successfully parsed food: ${formattedData.name}`);
    return successResponse(res, formattedData, 'Food parsed successfully');

  } catch (error) {
    logError('Image parsing failed', error);
    return errorResponse(res, error);
  }
});

// 新增：单独获取emoji
router.post('/emoji', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return errorResponse(res, new Error('Text is required and must be a string'));
    }
    const emoji = await openaiService.getFoodEmoji(text);
    return successResponse(res, { emoji }, 'Emoji generated');
  } catch (error) {
    logError('Emoji generation failed', error);
    return errorResponse(res, error);
  }
});

module.exports = router; 