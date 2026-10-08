/**
 * 验证工具函数
 */

// 验证必需字段
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  return true;
};

// 验证营养数据格式
const validateNutritionData = (nutrition) => {
  const requiredNutritionFields = ['calories', 'carbs', 'fats', 'protein'];
  return validateRequiredFields(nutrition, requiredNutritionFields);
};

// 清理营养数据，只保留指定字段
const cleanNutritionData = (nutrition) => {
  if (!nutrition || typeof nutrition !== 'object' || Array.isArray(nutrition)) {
    throw new Error('Nutrition data must be an object');
  }

  const normalizeValue = (value, field) => {
    if (value === undefined || value === null || value === '') return 0;

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100000) {
      throw new Error(`${field} must be a number between 0 and 100000`);
    }

    return Math.round(parsed * 100) / 100;
  };

  return {
    calories: normalizeValue(nutrition.calories, 'Calories'),
    carbs: normalizeValue(nutrition.carbs, 'Carbs'),
    fats: normalizeValue(nutrition.fats, 'Fats'),
    protein: normalizeValue(nutrition.protein, 'Protein')
  };
};

const normalizeRequiredText = (value, fieldName, maxLength = 120) => {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';
  if (!normalizedValue) {
    throw new Error(`${fieldName} is required`);
  }
  if (normalizedValue.length > maxLength) {
    throw new Error(`${fieldName} must be ${maxLength} characters or fewer`);
  }
  return normalizedValue;
};

const validateUuid = (value, fieldName = 'ID') => {
  const uuid = typeof value === 'string' ? value.trim() : '';
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(uuid)) {
    throw new Error(`${fieldName} must be a valid UUID`);
  }
  return uuid;
};

const validateCollectionPayload = ({ collection_type, puzzle_name, nutrition, count }) => {
  const normalizedCount = count === undefined || count === null ? 1 : Number(count);
  if (!Number.isInteger(normalizedCount) || normalizedCount < 1 || normalizedCount > 100) {
    throw new Error('Count must be a whole number between 1 and 100');
  }

  return {
    collection_type: normalizeRequiredText(collection_type, 'Collection type'),
    puzzle_name: normalizeRequiredText(puzzle_name, 'Puzzle name'),
    nutrition: nutrition === undefined || nutrition === null ? {} : cleanNutritionData(nutrition),
    count: normalizedCount
  };
};

const validateFoodPayload = ({ name, nutrition, number_of_servings, time, emoji }) => {
  const normalizedName = typeof name === 'string' ? name.trim() : '';
  if (!normalizedName) {
    throw new Error('Food name is required');
  }
  if (normalizedName.length > 120) {
    throw new Error('Food name must be 120 characters or fewer');
  }

  const servings = number_of_servings === undefined || number_of_servings === null
    ? 1
    : Number(number_of_servings);
  if (!Number.isInteger(servings) || servings < 1 || servings > 100) {
    throw new Error('Number of servings must be a whole number between 1 and 100');
  }

  const date = time === undefined || time === null || time === '' ? new Date() : new Date(time);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Time must be a valid date');
  }

  const normalizedEmoji = typeof emoji === 'string' && emoji.trim()
    ? Array.from(emoji.trim()).slice(0, 16).join('')
    : '🍽️';

  return {
    name: normalizedName,
    nutrition: cleanNutritionData(nutrition),
    number_of_servings: servings,
    time: date.toISOString(),
    emoji: normalizedEmoji
  };
};

// 验证文件类型
const validateFileType = (file, allowedTypes) => {
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error(`Invalid file type. Only ${allowedTypes.join(', ')} are allowed.`);
  }
  return true;
};

// 验证文件大小
const validateFileSize = (file, maxSize) => {
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
  }
  return true;
};

const validateImageSignature = (file) => {
  const header = file.buffer?.subarray(0, 8);
  const isJpeg = header?.[0] === 0xff && header?.[1] === 0xd8 && header?.[2] === 0xff;
  const isPng = header?.length >= 8
    && header[0] === 0x89
    && header[1] === 0x50
    && header[2] === 0x4e
    && header[3] === 0x47
    && header[4] === 0x0d
    && header[5] === 0x0a
    && header[6] === 0x1a
    && header[7] === 0x0a;

  if (!isJpeg && !isPng) {
    throw new Error('The uploaded file is not a valid JPEG or PNG image');
  }

  return true;
};

module.exports = {
  validateRequiredFields,
  validateNutritionData,
  cleanNutritionData,
  normalizeRequiredText,
  validateUuid,
  validateCollectionPayload,
  validateFoodPayload,
  validateFileType,
  validateFileSize,
  validateImageSignature
};
