// 特殊puzzle配置
export const SPECIAL_PUZZLES = {
  'salmon nigiri boy': {
    name: 'Salmon Nigiri Boy',
    img: '/assets/puzzles/salmon_nigiri_boy.svg',
    description: 'The cutest sushi sidekick with a wink and a salmon-sized heart!',
    collectionType: 'Salmon Nigiri Boy',
    // 特殊样式配置
    imageStyle: {
      width: '200px',
      height: '200px',
      flexShrink: '0',
      aspectRatio: '1/1'
    },
    // 不需要nutritionModule
    hasNutritionModule: false,
    // 是否为合成puzzle（需要收集其他puzzle才能解锁）
    isSynthesisPuzzle: true,
    // 解锁条件
    unlockConditions: ['salmon', 'sushi rice']
  }
};

// 判断是否为特殊puzzle
export function isSpecialPuzzle(puzzleName) {
  if (!puzzleName) return false;
  return Object.keys(SPECIAL_PUZZLES).includes(puzzleName.toLowerCase());
}

// 获取特殊puzzle配置
export function getSpecialPuzzleConfig(puzzleName) {
  if (!puzzleName) return null;
  return SPECIAL_PUZZLES[puzzleName.toLowerCase()] || null;
}

// 判断puzzle是否需要nutritionModule
export function hasNutritionModule(puzzleName) {
  const config = getSpecialPuzzleConfig(puzzleName);
  if (config) {
    return config.hasNutritionModule;
  }
  return true; // 默认都有nutritionModule
}

// 获取puzzle的图片样式
export function getPuzzleImageStyle(puzzleName) {
  const config = getSpecialPuzzleConfig(puzzleName);
  if (config && config.imageStyle) {
    return config.imageStyle;
  }
  return {}; // 默认样式
}

// 获取puzzle的collectionType
export function getPuzzleCollectionType(puzzleName) {
  const config = getSpecialPuzzleConfig(puzzleName);
  if (config) {
    return config.collectionType;
  }
  
  // 默认逻辑
  const puzzleNameLower = puzzleName.toLowerCase();
  if (puzzleNameLower === 'salmon' || puzzleNameLower === 'sushi rice' || puzzleNameLower === 'salmon nigiri boy') {
    return 'Salmon Nigiri Boy';
  }
  return 'Magic Garden';
}

// 获取puzzle的图片URL
export function getPuzzleImageUrl(puzzleName, defaultPuzzle = null) {
  const config = getSpecialPuzzleConfig(puzzleName);
  if (config) {
    return config.img;
  }
  return defaultPuzzle?.img || '/assets/puzzles/puzzle_carrot.svg';
}

// 获取puzzle的描述
export function getPuzzleDescription(puzzleName, defaultPuzzle = null) {
  const config = getSpecialPuzzleConfig(puzzleName);
  if (config) {
    return config.description;
  }
  return defaultPuzzle?.description || "Bright, balanced, and well-fed. That's the carrot energy we love to see.";
}

// 判断是否为合成puzzle
export function isSynthesisPuzzle(puzzleName) {
  const config = getSpecialPuzzleConfig(puzzleName);
  if (config) {
    return config.isSynthesisPuzzle;
  }
  return false;
}

// 获取puzzle的解锁条件
export function getPuzzleUnlockConditions(puzzleName) {
  const config = getSpecialPuzzleConfig(puzzleName);
  if (config) {
    return config.unlockConditions;
  }
  return [];
} 