import { supabase } from '../supabaseClient';
import { collectionApi } from './api';
import { getAuthToken } from './user';
import { handlePuzzleCompletion } from './selectableCardCollection';

// 检查puzzle是否完成（puzzle_progress === 1）
export const checkPuzzleCompletion = (puzzleProgress) => {
  return puzzleProgress === 1;
};

// 获取puzzle在collection中的位置信息（从API获取）
export const getPuzzleCollectionInfo = async (puzzleName) => {
  try {
    const response = await collectionApi.getCollectionPuzzles();
    if (response.success && response.data) {
      return response.data.find(puzzle => puzzle.puzzle_name === puzzleName);
    }
  } catch (error) {
    console.error('Error fetching collection puzzles:', error);
  }
  
  // 如果API失败，使用默认配置
  const MAGIC_GARDEN_PUZZLES = [
    { puzzle_name: 'Carrot', slot: 1, collection_type: 'Magic Garden' },
    { puzzle_name: 'Avocado', slot: 2, collection_type: 'Magic Garden' },
    { puzzle_name: 'Corn', slot: 3, collection_type: 'Magic Garden' },
    { puzzle_name: 'Tomato', slot: 4, collection_type: 'Magic Garden' },
    { puzzle_name: 'Broccoli', slot: 5, collection_type: 'Magic Garden' },
  ];

  const SALMON_NIGIRI_PUZZLES = [
    { puzzle_name: 'Salmon', slot: 1, collection_type: 'Salmon Nigiri Boy' },
    { puzzle_name: 'Sushi Rice', slot: 2, collection_type: 'Salmon Nigiri Boy' },
    { puzzle_name: 'Salmon Nigiri Boy', slot: 3, collection_type: 'Salmon Nigiri Boy' },
  ];

  const allPuzzles = [...MAGIC_GARDEN_PUZZLES, ...SALMON_NIGIRI_PUZZLES];
  return allPuzzles.find(puzzle => puzzle.puzzle_name === puzzleName);
};

// 添加或更新puzzle到collections
export const addPuzzleToCollection = async (userId, puzzleName, nutritionData) => {
  try {
    if (!userId || !puzzleName) {
      console.error('Missing required parameters for adding puzzle to collection');
      return { success: false, error: 'Missing required parameters' };
    }

    const puzzleInfo = await getPuzzleCollectionInfo(puzzleName);
    if (!puzzleInfo) {
      console.error(`Puzzle ${puzzleName} not found in collection configuration`);
      return { success: false, error: 'Puzzle not found in collection' };
    }

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

    // 检查puzzle是否完成
    if (!checkPuzzleCompletion(puzzle_progress) || !puzzle_name) {
      return { success: false, error: 'Puzzle not completed or missing puzzle name' };
    }

    // 记录 puzzle 完成状态
    handlePuzzleCompletion(puzzle_name, puzzle_progress);

    // 检查是否已经存在这个puzzle的collection记录
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
            
            // 如果已经存在collection记录，说明之前已经完成过，不需要重复添加
            if (existingCollection) {
              console.log(`Puzzle ${puzzle_name} already exists in collection, skipping`);
              return { success: true, message: 'Puzzle already collected' };
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

    // 添加到collections（只在首次完成时）
    const result = await addPuzzleToCollection(userId, puzzle_name, nutritionData);
    
    if (result.success) {
      console.log(`Successfully added ${puzzle_name} to collections for the first time`);
    }

    return result;
  } catch (error) {
    console.error('Error in monitorPuzzleCompletion:', error);
    return { success: false, error: 'Failed to monitor puzzle completion' };
  }
}; 