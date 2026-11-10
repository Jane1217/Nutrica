const express = require('express');
const router = express.Router();
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const openaiService = require('../services/openaiService');
const { authenticateUser } = require('../middleware/auth');
const {
  cleanNutritionData,
  validateFileType,
  validateFileSize,
  validateImageSignature
} = require('../utils/validation');
const { successResponse, errorResponse, fileUploadErrorResponse } = require('../utils/response');
const { logInfo, logError } = require('../utils/logger');
const { extractFirstEmoji, calorieMismatch, isLikelyMisread } = require('../utils/nutritionLabel');

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

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: 'Too many AI requests. Please try again in a few minutes.' }
  }
});

const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_EMOJI_TEXT_LENGTH = 200;

const parseModelJson = (content) => {
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('AI returned an empty response');
  }

  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();
  const parsed = JSON.parse(cleaned);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('AI returned an invalid response');
  }

  return parsed;
};

// Emoji comes back in the same model call (saves a full round trip); only ask
// again when it is missing or not a real emoji.
const resolveEmoji = async (modelEmoji, fallbackText) => (
  extractFirstEmoji(modelEmoji) || openaiService.getFoodEmoji(fallbackText)
);

const readLabelNutrition = (data) => cleanNutritionData({
  calories: data.calories ?? data.Calories,
  carbs: data.carbs ?? data.Carbs,
  fats: data.fats ?? data.Fats,
  protein: data.protein ?? data.Protein
});

// AI endpoints consume billable provider capacity. Require a real user session
// and cap burst usage before calling OpenAI.
router.use(authenticateUser, aiLimiter);

// Parse food description
router.post('/description', async (req, res) => {
  try {
    logInfo('Processing food description analysis');

    const description = typeof req.body?.description === 'string'
      ? req.body.description.trim()
      : '';

    if (!description) {
      return errorResponse(res, new Error('Description is required and must be a string'), 400);
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return errorResponse(res, new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`), 400);
    }

    // Call OpenAI to analyze description
    const response = await openaiService.analyzeDescription(description);

    // Parse OpenAI response content
    const content = response.choices?.[0]?.message?.content;

    let nutritionData;
    try {
      nutritionData = parseModelJson(content);
    } catch (parseError) {
      logError('JSON parse error', parseError);
      return errorResponse(res, new Error('Food analysis could not be completed. Please try again.'), 422);
    }

    // If AI cannot understand the description
    if (nutritionData.error) {
      return errorResponse(res, new Error('Food analysis could not recognize that description.'), 422);
    }

    // 生成emoji
    const nutrition = cleanNutritionData(nutritionData);
    const emoji = await resolveEmoji(nutritionData.emoji, nutritionData.name || description);

    // Format response data to match frontend FoodModal
    const formattedData = {
      name: nutritionData.name || 'Unknown Food',
      ...nutrition,
      emoji
    };

    logInfo('Description analyzed successfully');
    return successResponse(res, formattedData, 'Description analyzed successfully');

  } catch (error) {
    logError('Description analysis failed', error);
    return errorResponse(res, error);
  }
});

// Parse food image
router.post('/food', upload.single('image'), async (req, res) => {
  try {
    logInfo('Processing food image upload');

    if (!req.file) {
      return fileUploadErrorResponse(res, 'No image file received');
    }

    // Validate file size
    try {
      validateFileSize(req.file, config.upload.maxFileSize);
      validateImageSignature(req.file);
    } catch (error) {
      return fileUploadErrorResponse(res, error.message);
    }

    // Convert buffer to base64
    const base64Image = req.file.buffer.toString('base64');
    // Call OpenAI to parse image
    const response = await openaiService.analyzeImage(base64Image, req.file.mimetype);

    // Parse OpenAI response content
    const content = response.choices?.[0]?.message?.content;

    let nutritionData;
    try {
      nutritionData = parseModelJson(content);
    } catch (parseError) {
      logError('JSON parse error', parseError);
      return errorResponse(res, new Error('Food analysis could not be completed. Please try again.'), 422);
    }

    // If AI cannot recognize (for image analysis)
    if (nutritionData.error) {
      return errorResponse(res, new Error('Food analysis could not recognize that image.'), 422);
    }

    let nutrition = readLabelNutrition(nutritionData);
    let finalData = nutritionData;

    // Cross-check calories against the macros. A big gap usually means a
    // misread digit or the wrong column, so re-read once with that hint and
    // keep whichever read is more self-consistent.
    if (isLikelyMisread(nutrition)) {
      try {
        const retry = await openaiService.analyzeImage(base64Image, req.file.mimetype, { previous: nutrition });
        const retryData = parseModelJson(retry.choices?.[0]?.message?.content);
        if (!retryData.error) {
          const retryNutrition = readLabelNutrition(retryData);
          if (calorieMismatch(retryNutrition) < calorieMismatch(nutrition)) {
            nutrition = retryNutrition;
            finalData = retryData;
            logInfo('Label re-read produced a more consistent result');
          }
        }
      } catch (retryError) {
        logError('Label re-read failed; keeping first result', retryError);
      }
    }

    const emoji = await resolveEmoji(finalData.emoji, finalData.name || '');

    // Format response data to match frontend FoodModal
    const formattedData = {
      name: finalData.name || 'Unknown Food',
      nutrition: {
        ...nutrition
      },
      number_of_servings: 1,
      emoji
    };

    logInfo('Food image parsed successfully');
    return successResponse(res, formattedData, 'Food parsed successfully');

  } catch (error) {
    logError('Image parsing failed', error);
    return errorResponse(res, error);
  }
});

// 新增：单独获取emoji
router.post('/emoji', async (req, res) => {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text) {
      return errorResponse(res, new Error('Text is required and must be a string'), 400);
    }
    if (text.length > MAX_EMOJI_TEXT_LENGTH) {
      return errorResponse(res, new Error(`Text must be ${MAX_EMOJI_TEXT_LENGTH} characters or fewer`), 400);
    }
    const emoji = await openaiService.getFoodEmoji(text);
    return successResponse(res, { emoji }, 'Emoji generated');
  } catch (error) {
    logError('Emoji generation failed', error);
    return errorResponse(res, error);
  }
});

module.exports = router;
