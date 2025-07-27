import carrot, { carrotColorOrder } from './carrot';
import avocado, { avocadoColorOrder } from './avocado';
import tomato, { tomatoColorOrder } from './tomato';
import corn, { cornColorOrder } from './corn';
import broccoli, { broccoliColorOrder } from './broccoli';
import pumpkin, { pumpkinColorOrder } from './pumpkin';

export const puzzleCategories = [
  {
    id: 'magic_garden',
    title: 'Magic Garden',
    desc: 'Complete daily nutrition challenge and collect 6 nutrition puzzles in the Magic Garden. Little by little, your garden is coming alive. Keep tending to it with care.',
    count: 6,
    type: 'collection',
    bgColor: '#A9C971', // 浅蓝色背景
    //pieces: [1, 1, 1, 0, 0, 0],
    puzzles: [carrot, avocado, tomato, corn, broccoli, pumpkin]
  },
  // 其他分类可继续添加
  {
    id: 'synthesis_puzzles',
    title: 'Synthesis Puzzles',
    desc: 'Combine different nutrition elements to create new and exciting puzzle combinations. Master the art of nutrition synthesis.',
    count: 2,
    type: 'synthesis',
    bgColor: '#FBBC91', // 浅粉色背景
    puzzles: [carrot, avocado] // 暂时使用现有的拼图，后续可以替换为合成式拼图
  },
];

export const colorOrders = {
  carrot: carrotColorOrder,
  avocado: avocadoColorOrder,
  tomato: tomatoColorOrder,
  corn: cornColorOrder,
  broccoli: broccoliColorOrder,
  pumpkin: pumpkinColorOrder,
  // 其他puzzle...
};
