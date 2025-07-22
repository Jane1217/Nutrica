//carrot pixelMap像素数据定义
const B = { color: '#FFFFFF', nutrient: 0 };      // 背景
const C1 = { color: '#FF9F58', nutrient: 1 };     // 碳水-浅橙
const C2 = { color: '#FB6D03', nutrient: 1 };     // 碳水-中橙
const C3 = { color: '#FB3503', nutrient: 1 };     // 碳水-深橙
const C4 = { color: '#B92F17', nutrient: 1 };     // 碳水-褐橙
const P1 = { color: '#3B0E09', nutrient: 2 };     // 蛋白-深棕
const F1 = { color: '#98E673', nutrient: 3 };     // 脂肪-浅绿
const F2 = { color: '#60BF32', nutrient: 3 };     // 脂肪-中绿
const F3 = { color: '#0FA23A', nutrient: 3 };     // 脂肪-深绿
const F4 = { color: '#1D793B', nutrient: 3 };     // 脂肪-墨绿

export const COLOR_DEFS = { C1, C2, C3, C4, P1, F1, F2, F3, F4 };

export const puzzleCategories = [
  {
    id: 'magic_garden',
    title: 'Magic Garden',
    desc: 'Complete daily nutrition challenge and collect 6 nutrition puzzles in the Magic Garden. Little by little, your garden is coming alive. Keep tending to it with care.',
    count: 6,
    pieces: [1, 1, 1, 0, 0, 0], // 1:已获得, 0:未获得
    puzzles: [
      {
        id: 'carrot',
        name: 'Carrot',
        description: "Bright, balanced, and well-fed. That's the carrot energy we love to see.",
        img: '/assets/puzzles/puzzle_carrot.svg',
        inCollection: true,
        bgColor: '#FFB279',
        pixelMap: [
          // 1
          [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
          // 2
          [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
          // 3
          [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
          // 4
          [B,B,B,B,B,B,B,B,B,B,B,B,P1,P1,B,B,P1,P1,B,P1,B,B,B,B],
          // 5
          [B,B,B,B,B,B,B,B,B,B,B,P1,F2,F2,P1,P1,F2,F2,P1,F1,P1,B,B,B],
          // 6
          [B,B,B,B,B,B,B,B,B,B,B,B,P1,F4,F3,F2,F2,F4,F3,F2,P1,B,B,B],
          // 7
          [B,B,B,B,B,B,B,B,B,B,B,B,B,P1,F4,F3,F2,F3,F4,P1,B,B,B,B],
          // 8
          [B,B,B,B,B,B,B,B,B,B,B,P1,P1,F4,F4,F4,F3,F4,F4,F2,P1,B,B,B],
          // 9
          [B,B,B,B,B,B,B,B,B,B,P1,C1,C2,C3,C3,F4,F3,F4,P1,F4,F2,P1,B,B],
          // 10
          [B,B,B,B,B,B,B,B,B,P1,C1,C1,C2,C2,C3,C3,C4,F4,B,P1,P1,P1,B,B],
          // 11
          [B,B,B,B,B,B,B,B,P1,C4,C4,C2,C2,C2,C3,C4,C4,P1,B,B,B,P1,B,B],
          // 12
          [B,B,B,B,B,B,B,B,C1,C3,C3,C2,C2,C3,C3,C4,C4,P1,B,B,B,B,B,B],
          // 13
          [B,B,B,B,B,B,B,P1,C1,C2,C3,C3,C3,C3,C4,C4,P1,B,B,B,B,B,B,B],
          // 14
          [B,B,B,B,B,B,P1,C1,C2,C2,C2,C3,C4,C4,C4,P1,B,B,B,B,B,B,B,B],
          // 15
          [B,B,B,B,B,B,C2,C2,C2,C2,C3,C4,C4,C4,P1,B,B,B,B,B,B,B,B,B],
          // 16
          [B,B,B,B,B,P1,C2,C2,C3,C3,C4,C4,C4,P1,B,B,B,B,B,B,B,B,B,B],
          // 17
          [B,B,B,B,P1,C2,C2,C3,C3,C4,C4,P1,B,B,B,B,B,B,B,B,B,B,B,B],
          // 18
          [B,B,B,B,P1,C2,C3,C4,C4,P1,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
          // 19
          [B,B,B,P1,C2,C4,C4,C4,P1,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
          // 20
          [B,B,B,C4,C4,P1,P1,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
          // 21
          [B,B,B,P1,P1,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
          // 22
          [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
          // 23
          [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
          // 24
          [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
        ]
      },
      // 其他puzzle...
    ]
  },
  // 其他分类...
];

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