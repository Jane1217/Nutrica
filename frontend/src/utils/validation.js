/**
 * 前端验证工具函数
 */

// 验证邮箱格式
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证密码强度
export const validatePassword = (password) => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  return { isValid: true, message: '' };
};

// 验证营养数据
export const validateNutritionData = (nutrition) => {
  const requiredFields = ['calories', 'carbs', 'fats', 'protein'];
  const missingFields = requiredFields.filter(field => !nutrition[field]);
  
  if (missingFields.length > 0) {
    return { isValid: false, message: `Missing required fields: ${missingFields.join(', ')}` };
  }
  
  return { isValid: true, message: '' };
};

// 验证食物表单
export const validateFoodForm = (form) => {
  const requiredFields = ['name'];
  const missingFields = requiredFields.filter(field => !form[field]);
  
  if (missingFields.length > 0) {
    return { isValid: false, message: `Missing required fields: ${missingFields.join(', ')}` };
  }
  
  // 检查营养数据
  const nutritionFields = ['calories', 'carbs', 'fats', 'protein'];
  const missingNutrition = nutritionFields.filter(field => !form[field]);
  
  if (missingNutrition.length > 0) {
    return { isValid: false, message: `Missing nutrition data: ${missingNutrition.join(', ')}` };
  }
  
  // 如果有number_of_servings字段，验证它
  if (form.hasOwnProperty('number_of_servings') && form.number_of_servings <= 0) {
    return { isValid: false, message: 'Number of servings must be greater than 0' };
  }
  
  return { isValid: true, message: '' };
};

// 验证数字输入
export const validateNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  if (isNaN(num)) {
    return { isValid: false, message: 'Please enter a valid number' };
  }
  if (num < min) {
    return { isValid: false, message: `Value must be at least ${min}` };
  }
  if (num > max) {
    return { isValid: false, message: `Value must be no more than ${max}` };
  }
  return { isValid: true, message: '' };
}; 