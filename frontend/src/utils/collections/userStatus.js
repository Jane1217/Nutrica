import { puzzleCategories } from '../../data/puzzles';
import { collectionApi } from '../core';
import { getAuthToken } from '../core';

// 缓存机制
let collectionStatusCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 从数据库获取用户的收藏状态
export const getUserCollectionStatus = async (userId, forceRefresh = false) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return {};
    }

    // 检查缓存是否有效
    const now = Date.now();
    if (!forceRefresh && collectionStatusCache && (now - cacheTimestamp) < CACHE_DURATION) {
      return collectionStatusCache;
    }

    // 获取当前用户的收藏数据
    const magicGardenResponse = await collectionApi.getUserCollections('Magic Garden', token);
    const salmonNigiriResponse = await collectionApi.getUserCollections('Salmon Nigiri Boy', token);
    
    const collectionStatus = {};
    
    if (magicGardenResponse.success && magicGardenResponse.data) {
      magicGardenResponse.data.forEach(item => {
        collectionStatus[item.puzzle_name.toLowerCase()] = true;
      });
    }
    
    if (salmonNigiriResponse.success && salmonNigiriResponse.data) {
      salmonNigiriResponse.data.forEach(item => {
        collectionStatus[item.puzzle_name.toLowerCase()] = true;
      });
    }
    
    // 更新缓存
    collectionStatusCache = collectionStatus;
    cacheTimestamp = now;
    
    return collectionStatus;
  } catch (error) {
    // 如果是认证错误，静默处理
    if (error.message && error.message.includes('401')) {
      return {};
    }
    console.error('Error fetching user collection status:', error);
    return {};
  }
};

// 清除缓存（当用户完成新的 puzzle 时调用）
export const clearCollectionCache = () => {
  collectionStatusCache = null;
  cacheTimestamp = 0;
};

// 预加载收藏状态（在应用启动时调用）
export const preloadCollectionStatus = async (userId) => {
  if (!userId) return;
  
  try {
    await getUserCollectionStatus(userId);
  } catch (error) {
    // 如果是认证错误，静默处理（用户可能还没有完全登录）
    if (error.message && error.message.includes('401')) {
      return;
    }
    console.error('Error preloading collection status:', error);
  }
};

// 检查特定 puzzle 是否在用户收藏中
export const isPuzzleInUserCollection = async (puzzleName, userId) => {
  try {
    const collectionStatus = await getUserCollectionStatus(userId);
    return collectionStatus[puzzleName.toLowerCase()] || false;
  } catch (error) {
    console.error('Error checking puzzle collection status:', error);
    return false;
  }
};

// 获取 puzzle 的 inCollection 状态
export const getPuzzleInCollection = async (puzzleName, userId) => {
  if (!userId) {
    // 如果没有用户ID，返回默认状态
    return false;
  }
  
  try {
    return await isPuzzleInUserCollection(puzzleName, userId);
  } catch (error) {
    console.error('Error getting puzzle inCollection:', error);
    return false;
  }
};

// 检查 puzzle 是否已完成（进度为 100%）
export const isPuzzleCompleted = (puzzleProgress) => {
  return puzzleProgress === 1;
};

// 当 puzzle 完成时，处理完成逻辑
export const handlePuzzleCompletion = (puzzleName, puzzleProgress) => {
  if (isPuzzleCompleted(puzzleProgress)) {
    // 清除缓存，确保下次获取最新数据
    clearCollectionCache();
    // 这里应该调用 API 将完成状态保存到数据库
    return true;
  }
  return false;
}; 