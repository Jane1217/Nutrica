// 根据puzzle名称和主题返回背景色
export function getPuzzleCardBackground(puzzleName, collectionType = 'Magic Garden') {
  const puzzleNameLower = puzzleName.toLowerCase();
  
  if (collectionType === 'Salmon Nigiri Boy') {
    if (puzzleNameLower === 'salmon' || puzzleNameLower === 'sushi rice') {
      return '#FBD891';
    } else if (puzzleNameLower === 'salmon nigiri boy') {
      return '#FBBC91';
    }
  }
  
  // Magic Garden主题
  if (collectionType === 'Magic Garden') {
    switch (puzzleNameLower) {
      case 'avocado':
        return '#9ED987';
      case 'tomato':
        return '#FFCBC5';
      case 'corn':
        return '#F6E78C';
      case 'broccoli':
        return '#C7F58C';
      case 'carrot':
      default:
        return '#FFB279';
    }
  }
  
  // 默认背景色
  return '#FFB279';
}

// 根据主题返回页面背景色
export function getPageBackground(collectionType = 'Magic Garden') {
  if (collectionType === 'Salmon Nigiri Boy') {
    return '#FBBC91';
  }
  
  // Magic Garden主题
  return '#A9C971';
} 