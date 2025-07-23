// puzzlesData.js
export { puzzleCategories, colorOrders } from './puzzles';

// 自动获取某类营养素的所有颜色（如C1~Cn），按编号排序
export function getColorOrder(prefix) {
  // prefix: 'C', 'P', 'F'
  const colorVars = Object.entries(COLOR_DEFS)
    .filter(([key, val]) => key.startsWith(prefix) && typeof val === 'object' && val.color)
    .sort((a, b) => {
      // 按数字编号排序
      const numA = parseInt(a[0].slice(prefix.length), 10);
      const numB = parseInt(b[0].slice(prefix.length), 10);
      return numA - numB;
    });
  return colorVars.map(([key, val]) => val.color);
} 