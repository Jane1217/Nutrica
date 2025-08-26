/**
 * 前端验证工具函数
 */

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

// 验证邮箱格式
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Not a valid email address format' };
  }
  return { isValid: true, message: '' };
};

// 验证密码强度
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, message: "Password doesn't meet requirements" };
  }
  return { isValid: true, message: '' };
};

// 通用表单验证
export const validateForm = (form, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rule = validationRules[field];
    const value = form[field];
    
    if (rule.required && !value) {
      errors[field] = rule.message || `${field} is required`;
    } else if (rule.validator && value) {
      const validationResult = rule.validator(value);
      if (!validationResult.isValid) {
        errors[field] = validationResult.message;
      }
    }
  });
  
  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}; 