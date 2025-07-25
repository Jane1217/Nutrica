import { supabase } from '../supabaseClient';
import { foodApi, handleApiError } from './api';
import { multiplyNutrition } from './format';

// 通用的食物保存逻辑
export const saveFoodRecord = async (foodData, userId) => {
  try {
    // 获取访问令牌
    const session = await supabase.auth.getSession();
    const accessToken = session.data.session?.access_token;
    
    if (!accessToken) {
      throw new Error('Unable to get access token, please log in again');
    }
    
    const data = await foodApi.addFood(foodData, accessToken);
    
    if (data.success) {
      return { success: true, data: data.data };
    } else {
      throw new Error(data.error || 'Save failed');
    }
  } catch (error) {
    throw new Error(handleApiError(error, 'Save failed'));
  }
};

// 通用的食物表单验证逻辑
export const validateAndSaveFood = async (form, emoji = '🍽️', onDataChange) => {
  try {
    const nutrition = {
      calories: Number(form.calories),
      carbs: Number(form.carbs),
      fats: Number(form.fats),
      protein: Number(form.protein),
    };
    
    const foodData = {
      name: form.name,
      number_of_servings: 1, // 固定为1
      nutrition,
      emoji
    };
    
    const result = await saveFoodRecord(foodData);
    
    if (result.success && onDataChange) {
      onDataChange();
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// 获取食物emoji的通用逻辑
export const getFoodEmoji = async (foodName) => {
  try {
    const response = await foodApi.getFoodEmoji(foodName.trim());
    if (response.success && response.data.emoji) {
      return response.data.emoji;
    } else {
      throw new Error('AI failed to generate emoji');
    }
  } catch (error) {
    throw new Error('AI emoji generation failed');
  }
};

// 带emoji生成的食物保存逻辑
export const validateAndSaveFoodWithEmoji = async (form, onDataChange) => {
  try {
    // 先获取emoji
    const emoji = await getFoodEmoji(form.name);
    
    // 然后保存食物
    const result = await validateAndSaveFood(form, emoji, onDataChange);
    
    return result;
  } catch (error) {
    throw error;
  }
};

// 带servings数量的食物保存逻辑
export const saveFoodWithServings = async (form, baseNutrition, emoji = '🍽️', onDataChange) => {
  try {
    const nutrition = multiplyNutrition(baseNutrition, form.number_of_servings);
    
    const foodData = {
      name: form.name,
      number_of_servings: Number(form.number_of_servings),
      nutrition,
      emoji
    };
    
    const result = await saveFoodRecord(foodData);
    
    if (result.success && onDataChange) {
      onDataChange();
    }
    
    return result;
  } catch (error) {
    throw error;
  }
};

// 解析食物描述
export const parseFoodDescription = async (description) => {
  try {
    const response = await foodApi.parseFoodDescription(description);
    if (response.success) {
      return { success: true, data: response.data };
    } else {
      throw new Error(response.error || 'AI analysis failed');
    }
  } catch (error) {
    throw new Error(handleApiError(error, 'AI analysis failed'));
  }
};