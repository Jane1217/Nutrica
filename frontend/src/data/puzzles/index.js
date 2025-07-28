import carrot, { carrotColorOrder } from './carrot';
import avocado, { avocadoColorOrder } from './avocado';
import tomato, { tomatoColorOrder } from './tomato';
import corn, { cornColorOrder } from './corn';
import broccoli, { broccoliColorOrder } from './broccoli';
import salmon, { salmonColorOrder } from './salmon';
import sushi_rice, { sushi_riceColorOrder } from './sushi_rice';

export const puzzleCategories = [
  {
    id: 'magic_garden',
    title: 'Magic Garden',
    desc: 'Complete daily nutrition challenge and collect 5 nutrition puzzles in the Magic Garden. Little by little, your garden is coming alive. Keep tending to it with care.',
    count: 5,
    type: 'collection',
    bgColor: '#A9C971', // 浅蓝色背景
    //pieces: [1, 1, 1, 0, 0, 0],
    puzzles: [carrot, avocado, tomato, corn, broccoli]
  },
  // 其他分类可继续添加
  {
    id: 'salmon_nigiri_boy',
    title: 'Salmon Nigiri Boy',
    desc: 'Collect two puzzles to unlock Salmon Nigiri Boy! The cutest sushi sidekick with a wink and a salmon-sized heart',
    count: 2,
    type: 'synthesis',
    bgColor: '#FBBC91', 
    puzzles: [salmon, sushi_rice], // 暂时使用现有的拼图，后续可以替换为合成式拼图
    resultImage: '/assets/puzzles/salmon_nigiri_boy.svg' // 合成后的结果图像
  },
];

export const colorOrders = {
  carrot: carrotColorOrder,
  avocado: avocadoColorOrder,
  tomato: tomatoColorOrder,
  corn: cornColorOrder,
  broccoli: broccoliColorOrder,
  salmon: salmonColorOrder,
  sushi_rice: sushi_riceColorOrder,
  // 其他puzzle...
};
