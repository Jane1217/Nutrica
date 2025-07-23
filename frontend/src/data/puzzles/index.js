import carrot, { carrotColorOrder } from './carrot';
import avocado, { avocadoColorOrder } from './avocado';

export const puzzleCategories = [
  {
    id: 'magic_garden',
    title: 'Magic Garden',
    desc: 'Complete daily nutrition challenge and collect 6 nutrition puzzles in the Magic Garden. Little by little, your garden is coming alive. Keep tending to it with care.',
    count: 6,
    pieces: [1, 1, 1, 0, 0, 0],
    puzzles: [carrot, avocado]
  },
  // 其他分类可继续添加
];

export const colorOrders = {
  carrot: carrotColorOrder,
  avocado: avocadoColorOrder,
  // 其他puzzle...
};
