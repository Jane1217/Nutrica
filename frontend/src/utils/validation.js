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