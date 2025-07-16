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
  return {
    calories: Number(nutrition.calories) || 0,
    carbs: Number(nutrition.carbs) || 0,
    fats: Number(nutrition.fats) || 0,
    protein: Number(nutrition.protein) || 0
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

module.exports = {
  validateRequiredFields,
  validateNutritionData,
  cleanNutritionData,
  validateFileType,
  validateFileSize
}; 