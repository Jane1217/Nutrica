import { supabase } from '../../supabaseClient';
import { collectionApi } from '../core';
import { getAuthToken } from '../core';
import { handlePuzzleCompletion } from './userStatus';

// 检查puzzle是否完成（puzzle_progress === 1）
export const checkPuzzleCompletion = (puzzleProgress) => {
  return puzzleProgress === 1;
};

// 获取puzzle在collection中的位置信息（从API获取）
export const getPuzzleCollectionInfo = async (puzzleName) => {
  try {
    const response = await collectionApi.getCollectionPuzzles();
    if (response.success && response.data) {
      const puzzleInfo = response.data.find(puzzle => puzzle.puzzle_name === puzzleName);
      if (puzzleInfo) {
        console.log(`Found puzzle info for ${puzzleName}:`, puzzleInfo);
        return puzzleInfo;
      } else {
        console.error(`Puzzle ${puzzleName} not found in collection_puzzles table`);
        return null;
      }
    } else {
      console.error('Failed to fetch collection puzzles:', response.error);
      return null;
    }
  } catch (error) {
    console.error('Error fetching collection puzzles:', error);
    return null;
  }
};

// 添加或更新puzzle到collections
export const addPuzzleToCollection = async (userId, puzzleName, nutritionData) => {
  try {
    if (!userId || !puzzleName) {
      console.error('Missing required parameters for adding puzzle to collection');
      return { success: false, error: 'Missing required parameters' };
    }

    console.log(`Attempting to add puzzle ${puzzleName} to collection for user ${userId}`);
    
    const puzzleInfo = await getPuzzleCollectionInfo(puzzleName);
    if (!puzzleInfo) {
      console.error(`Puzzle ${puzzleName} not found in collection configuration`);
      return { success: false, error: 'Puzzle not found in collection' };
    }

    console.log(`Found puzzle info:`, puzzleInfo);

    // 获取认证token
    const token = await getAuthToken();
    if (!token) {
      console.error('No authentication token available');
      return { success: false, error: 'No authentication token' };
    }

    // 使用后端API而不是直接调用Supabase
    const response = await collectionApi.addUserCollection({
      collection_type: puzzleInfo.collection_type || 'Magic Garden',
      puzzle_name: puzzleName,
      nutrition: nutritionData,
      count: 1
    }, token);

    if (response.success) {
      console.log(`Successfully added/updated collection for ${puzzleName}`);
      return { success: true };
    } else {
      console.error('Failed to add collection via API:', response.error);
      return { success: false, error: response.error };
    }
  } catch (error) {
    console.error('Error in addPuzzleToCollection:', error);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

// 监听daily_home_data变化并自动添加到collections
export const monitorPuzzleCompletion = async (userId, dailyHomeData) => {
  try {
    if (!userId || !dailyHomeData) {
      return { success: false, error: 'Missing required parameters' };
    }

    // 修复：使用正确的字段名 - daily_home_data确实有puzzle_name字段
    const { puzzle_name, puzzle_progress, carbs_goal, protein_goal, fats_goal } = dailyHomeData;

    console.log(`Monitoring puzzle completion for ${puzzle_name}, progress: ${puzzle_progress}`);

    // 检查puzzle是否完成
    if (!checkPuzzleCompletion(puzzle_progress) || !puzzle_name) {
      console.log(`Puzzle ${puzzle_name} not completed or missing puzzle name`);
      return { success: false, error: 'Puzzle not completed or missing puzzle name' };
    }

    console.log(`Puzzle ${puzzle_name} is completed!`);

    // 记录 puzzle 完成状态
    handlePuzzleCompletion(puzzle_name, puzzle_progress, userId);

    // 检查今天是否已经收集过这个puzzle
    try {
      const token = await getAuthToken();
      if (token) {
        const puzzleInfo = await getPuzzleCollectionInfo(puzzle_name);
        if (puzzleInfo && puzzleInfo.collection_type) {
          const response = await collectionApi.getUserCollections(puzzleInfo.collection_type, token);
          if (response.success && response.data) {
            const existingCollection = response.data.find(
              collection => collection.puzzle_name === puzzle_name
            );
            
            if (existingCollection) {
              // 检查是否今天已经收集过
              const today = new Date().toISOString().split('T')[0];
              const lastCollectedDate = existingCollection.updated_at ? 
                existingCollection.updated_at.split('T')[0] : 
                existingCollection.created_at.split('T')[0];
              
              if (lastCollectedDate === today) {
                console.log(`Puzzle ${puzzle_name} already collected today, skipping`);
                return { success: true, message: 'Puzzle already collected today' };
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error checking existing collection:', error);
      // 如果检查失败，我们仍然尝试添加，让后端处理重复问题
    }

    // 准备nutrition数据
    const nutritionData = {
      carbs: carbs_goal || 0,
      protein: protein_goal || 0,
      fats: fats_goal || 0
    };

    console.log(`Adding ${puzzle_name} to collections with nutrition data:`, nutritionData);

    // 添加到collections（只在今天首次完成时）
    const result = await addPuzzleToCollection(userId, puzzle_name, nutritionData);
    
    if (result.success) {
      console.log(`Successfully added ${puzzle_name} to collections for today`);
    } else {
      console.error(`Failed to add ${puzzle_name} to collections:`, result.error);
    }

    return result;
  } catch (error) {
    console.error('Error in monitorPuzzleCompletion:', error);
    return { success: false, error: 'Failed to monitor puzzle completion' };
  }
}; 