import { getAuthToken } from '../core';
import { collectionApi } from '../core';
import { 
  isSpecialPuzzle, 
  getSpecialPuzzleConfig, 
  isSynthesisPuzzle
} from '../puzzles';

/**
 * 通用模态框状态管理
 */
export const createModalState = (initialState = {}) => {
  const state = { ...initialState };
  
  const actions = {
    open: (modalName) => {
      // 关闭所有其他模态框
      Object.keys(state).forEach(key => {
        if (key.includes('Modal') || key.includes('show')) {
          state[key] = false;
        }
      });
      // 打开指定模态框
      if (state[`show${modalName}Modal`] !== undefined) {
        state[`show${modalName}Modal`] = true;
      }
    },
    
    close: (modalName) => {
      if (state[`show${modalName}Modal`] !== undefined) {
        state[`show${modalName}Modal`] = false;
      }
    },
    
    closeAll: () => {
      Object.keys(state).forEach(key => {
        if (key.includes('Modal') || key.includes('show')) {
          state[key] = false;
        }
      });
    },
    
    toggle: (modalName) => {
      if (state[`show${modalName}Modal`] !== undefined) {
        state[`show${modalName}Modal`] = !state[`show${modalName}Modal`];
      }
    }
  };
  
  return { state, actions };
};

/**
 * 获取模态框切换处理函数
 */
export const getModalHandlers = (setters) => {
  const handlers = {};
  
  Object.keys(setters).forEach(key => {
    if (key.startsWith('setShow') && key.endsWith('Modal')) {
      const modalName = key.replace('setShow', '').replace('Modal', '');
      handlers[`on${modalName}Close`] = () => setters[key](false);
      handlers[`on${modalName}Open`] = () => setters[key](true);
    }
  });
  
  return handlers;
};

/**
 * Toast管理工具函数
 */
export const createToastState = () => {
  const state = {
    showToast: false,
    toastMessage: '',
    toastType: 'info',
    toastDuration: 3000
  };
  
  const actions = {
    showToast: (message, type = 'info', duration = 3000) => {
      state.showToast = true;
      state.toastMessage = message;
      state.toastType = type;
      state.toastDuration = duration;
    },
    
    hideToast: () => {
      state.showToast = false;
    },
    
    showSuccessToast: (message, duration = 3000) => {
      actions.showToast(message, 'success', duration);
    },
    
    showErrorToast: (message, duration = 3000) => {
      actions.showToast(message, 'error', duration);
    },
    
    showInfoToast: (message, duration = 3000) => {
      actions.showToast(message, 'info', duration);
    }
  };
  
  return { state, actions };
};

/**
 * 获取Toast处理函数
 */
export const getToastHandlers = (setShowToast, setToastMessage) => {
  return {
    showToast: (message, type = 'info', duration = 3000) => {
      setToastMessage(message);
      setShowToast(true);
      // 自动隐藏
      setTimeout(() => setShowToast(false), duration);
    },
    
    hideToast: () => setShowToast(false),
    
    showSuccessToast: (message, duration = 3000) => {
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), duration);
    },
    
    showErrorToast: (message, duration = 3000) => {
      setToastMessage(message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), duration);
    }
  };
};

// 默认营养素标签
export const NUTRITION_LABELS = [
  { key: 'carbs', label: 'Carbs', nutrient: 1 },
  { key: 'protein', label: 'Protein', nutrient: 2 },
  { key: 'fats', label: 'Fats', nutrient: 3 }
];

/**
 * 获取puzzle图标路径
 * @param {string} puzzleName - puzzle名称
 * @returns {string} 图标路径
 */
export const getPuzzleIconPath = (puzzleName) => {
  const puzzleNameLower = puzzleName.toLowerCase();
  // Replace spaces with underscores for asset paths
  return `/assets/puzzles/puzzle_${puzzleNameLower.replace(/\s+/g, '_')}.svg`;
};

/**
 * 按顺序提取某营养素的所有颜色
 * @param {Array} pixelMap - 像素地图数据
 * @param {number} nutrientType - 营养素类型
 * @param {Array} colorOrder - 颜色顺序
 * @returns {Array} 过滤后的颜色数组
 */
export const getNutrientColorsByOrder = (pixelMap, nutrientType, colorOrder) => {
  if (!pixelMap) return [];
  const colorSet = new Set();
  for (let y = 0; y < pixelMap.length; y++) {
    for (let x = 0; x < pixelMap[y].length; x++) {
      const pix = pixelMap[y][x];
      if (pix.nutrient === nutrientType) {
        colorSet.add(pix.color);
      }
    }
  }
  return colorOrder.filter(color => colorSet.has(color));
};

/**
 * 检查是否应该显示CongratulationsModal并添加特殊puzzle到user_collections
 * @param {Array} collectionsData - 收集数据
 * @param {Function} setShowCongratulations - 设置显示CongratulationsModal的函数
 * @param {Function} setSalmonNigiriFirstCompletedAt - 设置首次完成时间的函数
 */
export const checkCongratulationsModal = async (collectionsData, setShowCongratulations, setSalmonNigiriFirstCompletedAt) => {
  // 检查所有特殊puzzle的解锁条件
  const specialPuzzles = ['salmon nigiri boy']; // 可以扩展更多特殊puzzle
  
  for (const puzzleName of specialPuzzles) {
    if (!isSynthesisPuzzle(puzzleName)) continue;
    
    const config = getSpecialPuzzleConfig(puzzleName);
    if (!config) continue;
    
    const collectionType = config.collectionType;
    const unlockConditions = config.unlockConditions;
    
    // 检查是否有该主题的收集
    const themeCollections = collectionsData.filter(
      collection => collection.collection_type === collectionType
    );
    
    // 检查是否收集了所有解锁条件
    const allConditionsMet = unlockConditions.every(condition =>
      themeCollections.some(
        collection => collection.puzzle_name.toLowerCase() === condition && (collection.collected || (collection.count && collection.count > 0))
      )
    );
    
    // 检查是否已经有该特殊puzzle的收集记录
    const puzzleAlreadyCollected = themeCollections.some(
      collection => collection.puzzle_name.toLowerCase() === puzzleName
    );
    
    // 如果所有条件都满足了
    if (allConditionsMet) {
      // 如果还没有该特殊puzzle的收集记录，则添加
      if (!puzzleAlreadyCollected) {
        try {
          const token = await getAuthToken();
          if (token) {
            const response = await collectionApi.addPuzzleToCollection({
              puzzle_name: config.name,
              collection_type: collectionType,
              nutrition: { carbs: 0, protein: 0, fats: 0 },
              first_completed_at: new Date().toISOString()
            }, token);
            
            if (response.success) {
              // Puzzle added to user_collections
            } else {
              console.error(`Failed to add ${config.name} to user_collections:`, response.error);
            }
          }
        } catch (error) {
          console.error(`Error adding ${config.name} to user_collections:`, error);
        }
      }
      
      // 检查是否已经显示过CongratulationsModal
      // 这里我们需要查询user_congratulations_shown表
      let hasShownCongratulations = false;
      try {
        const token = await getAuthToken();
        if (token) {
          const response = await collectionApi.getCongratulationsShownStatus(config.name, collectionType, token);
          if (response.success) {
            hasShownCongratulations = response.data && response.data.length > 0;
          }
        }
      } catch (error) {
        console.error('Error checking congratulations shown status:', error);
      }
      
      // 只有在第一次解锁且还没有显示过CongratulationsModal时才显示
      if (!hasShownCongratulations) {
        setShowCongratulations(true);
        
        // 标记为已显示（更新数据库）
        try {
          const token = await getAuthToken();
          if (token) {
            await collectionApi.updateCongratulationsShown(config.name, collectionType, token);
            // CongratulationsModal shown status updated in database
          }
        } catch (error) {
          console.error('Error updating congratulations shown status:', error);
        }
      }
      
      // 设置first_completed_at时间
      if (puzzleAlreadyCollected) {
        const existingPuzzle = themeCollections.find(
          collection => collection.puzzle_name.toLowerCase() === puzzleName
        );
        if (existingPuzzle && existingPuzzle.first_completed_at) {
          setSalmonNigiriFirstCompletedAt(existingPuzzle.first_completed_at);
        } else {
          setSalmonNigiriFirstCompletedAt(new Date().toISOString());
        }
      } else {
        setSalmonNigiriFirstCompletedAt(new Date().toISOString());
      }
      
      break; // 只处理第一个满足条件的特殊puzzle
    }
  }
}; 