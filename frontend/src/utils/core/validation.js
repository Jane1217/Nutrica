/**
 * 前端验证工具函数
 */

// 验证食物表单
export const validateFoodForm = (form) => {
  const name = typeof form?.name === 'string' ? form.name.trim() : '';
  if (!name) {
    return { isValid: false, message: 'Food name is required' };
  }
  if (name.length > 120) {
    return { isValid: false, message: 'Food name must be 120 characters or fewer' };
  }

  const nutritionFields = ['calories', 'carbs', 'fats', 'protein'];
  for (const field of nutritionFields) {
    const rawValue = form?.[field];
    if (rawValue === '' || rawValue === null || rawValue === undefined) {
      return { isValid: false, message: `${field} is required` };
    }
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value < 0 || value > 100000) {
      return { isValid: false, message: `${field} must be a number between 0 and 100000` };
    }
  }

  if (Object.prototype.hasOwnProperty.call(form, 'number_of_servings')) {
    const servings = Number(form.number_of_servings);
    if (!Number.isInteger(servings) || servings < 1 || servings > 100) {
      return { isValid: false, message: 'Number of servings must be a whole number between 1 and 100' };
    }
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
