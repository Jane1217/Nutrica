/**
 * 前端API工具函数
 */

import { supabase } from '../../supabaseClient';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '');

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
    headers: {} // 不添加认证头
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

// Collection相关API
export const collectionApi = {
  // 获取collection_puzzles数据
  getCollectionPuzzles: () => apiGet('/api/collection/collection-puzzles'),
  
  // 获取用户collections（需要认证）
  getUserCollections: (collectionType, token) => {
    const params = collectionType ? `?collection_type=${encodeURIComponent(collectionType)}` : '';
    return apiRequest(`/api/collection/user-collections${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  // 获取公开的collection数据（不需要认证）
  getPublicCollection: (userId, puzzleName) => {
    return apiRequest(`/api/collection/public-collection?user_id=${encodeURIComponent(userId)}&puzzle_name=${encodeURIComponent(puzzleName)}`, {
      method: 'GET'
    });
  },
  
  // 添加或更新用户collection
  addUserCollection: (data, token) => apiRequest('/api/collection/user-collections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  
  // 添加puzzle到collection
  addPuzzleToCollection: (data, token) => apiRequest('/api/collection/user-collections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  }),
  
  // 获取CongratulationsModal显示状态
  getCongratulationsShownStatus: (puzzleName, collectionType, token) => apiRequest(`/api/collection/congratulations-shown-status?puzzle_name=${encodeURIComponent(puzzleName)}&collection_type=${encodeURIComponent(collectionType)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }),
  
  // 更新CongratulationsModal显示状态
  updateCongratulationsShown: (puzzleName, collectionType, token) => apiRequest('/api/collection/update-congratulations-shown', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ puzzle_name: puzzleName, collection_type: collectionType })
  })
};

// 错误处理
export const handleApiError = (error, defaultMessage = 'API request failed') => {
  if (error.response) {
    // 服务器返回了错误状态码
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 401) {
      return 'Authentication failed. Please log in again.';
    } else if (status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    } else if (status === 404) {
      return 'Resource not found.';
    } else if (status === 429) {
      return 'Too many requests. Please try again later.';
    } else if (status >= 500) {
      return 'Server error. Please try again later.';
    } else if (data && data.error) {
      return data.error;
    } else {
      return `Request failed with status ${status}`;
    }
  } else if (error.request) {
    // 请求已发出但没有收到响应
    return 'No response from server. Please check your internet connection.';
  } else {
    // 请求设置时发生错误
    return error.message || defaultMessage;
  }
}; 