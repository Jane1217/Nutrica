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
    type: 'collection', // 第一种类型：收集式puzzle
    //pieces: [1, 1, 1, 0, 0, 0],
    puzzles: [carrot, avocado, tomato, corn, broccoli, pumpkin]
  },
  {
    id: 'fusion_kitchen',
    title: 'Fusion Kitchen',
    desc: 'Combine different nutrition elements to create unique fusion recipes. Mix and match ingredients to unlock special combination puzzles.',
    count: 4,
    type: 'fusion', // 第二种类型：合成式puzzle
    puzzles: [
      // 这里先放一些占位数据，后续可以根据需要调整
      {
        id: 'fusion_1',
        name: 'Protein Bowl',
        img: '/assets/puzzles/protein_bowl.svg',
        bgColor: '#FFE4E1',
        desc: 'Combine protein sources to create the ultimate protein bowl'
      },
      {
        id: 'fusion_2', 
        name: 'Energy Mix',
        img: '/assets/puzzles/energy_mix.svg',
        bgColor: '#E6F3FF',
        desc: 'Mix carbs and healthy fats for sustained energy'
      },
      {
        id: 'fusion_3',
        name: 'Balanced Plate',
        img: '/assets/puzzles/balanced_plate.svg', 
        bgColor: '#F0FFF0',
        desc: 'Create a perfectly balanced meal with all nutrients'
      },
      {
        id: 'fusion_4',
        name: 'Super Smoothie',
        img: '/assets/puzzles/super_smoothie.svg',
        bgColor: '#FFF8DC',
        desc: 'Blend fruits and protein for a nutritious smoothie'
      }
    ]
  }
  // 其他分类可继续添加
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
