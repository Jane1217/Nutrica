/**
 * 前端API工具函数
 */

import { supabase } from '../supabaseClient';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 获取认证头
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  return headers;
};

// 通用API请求函数
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const authHeaders = await getAuthHeaders();
  
  const defaultOptions = {
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// POST请求
export const apiPost = (endpoint, data) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// GET请求
export const apiGet = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'GET',
  });
};

// 文件上传
export const uploadFile = async (endpoint, file, onProgress = null) => {
  const formData = new FormData();
  formData.append('image', file);

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
};

// 食物相关API
export const foodApi = {
  // 添加食物
  addFood: (foodData, accessToken) => apiRequest('/api/food', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(foodData)
  }),
  
  // 解析食物图片
  parseFoodImage: (file) => uploadFile('/api/ai/parse/food', file),
  
  // 解析食物描述
  parseFoodDescription: (description) => apiPost('/api/ai/parse/description', { description }),
  
  // 获取食物emoji
  getFoodEmoji: (foodNameOrDesc) => apiPost('/api/ai/parse/emoji', { text: foodNameOrDesc }),
};

// 用户相关API
export const userApi = {
  // 删除用户账号
  deleteAccount: (userId, accessToken) => apiRequest('/api/user/delete-account', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ userId })
  }),
};

// 错误处理
export const handleApiError = (error, defaultMessage = '操作失败') => {
  if (error.message.includes('Network')) {
    return '网络连接失败，请检查网络设置';
  }
  if (error.message.includes('HTTP')) {
    return error.message;
  }
  return defaultMessage;
}; 