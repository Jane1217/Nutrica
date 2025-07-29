import { puzzleCategories } from '../../data/puzzles';
import { collectionApi } from '../core';
import { getAuthToken } from '../core';

// 从数据库获取用户的收藏状态
export const getUserCollectionStatus = async (userId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.error('No authentication token available');
      return {};
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
    
    return collectionStatus;
  } catch (error) {
    console.error('Error fetching user collection status:', error);
    return {};
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
  console.log(`Checking puzzle completion: ${puzzleName}, progress: ${puzzleProgress}`);
  if (isPuzzleCompleted(puzzleProgress)) {
    console.log(`Puzzle ${puzzleName} is completed!`);
    // 这里应该调用 API 将完成状态保存到数据库
    return true;
  }
  return false;
}; 