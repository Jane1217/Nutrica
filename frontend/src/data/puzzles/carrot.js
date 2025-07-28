// carrot.js
const B = { color: '#F3F3EC', nutrient: 0 };
const C1 = { color: '#FF9F58', nutrient: 1 };
const C2 = { color: '#FB6D03', nutrient: 1 };
const C3 = { color: '#FB3503', nutrient: 1 };
const C4 = { color: '#B92F17', nutrient: 1 };
const P1 = { color: '#3B0E09', nutrient: 2 };
const F1 = { color: '#98E673', nutrient: 3 };
const F2 = { color: '#60BF32', nutrient: 3 };
const F3 = { color: '#0FA23A', nutrient: 3 };
const F4 = { color: '#1D793B', nutrient: 3 };

const carrot = {
  id: 'carrot',
  name: 'Carrot',
  description: "Bright, balanced, and well-fed. That's the carrot energy we love to see.",
  descriptions: [
    "Even a carrot starts with almost nothing. Give your day a little care.",
    "You've planted the rhythm. A little balance, like a carrot finding light.",
    "Halfway there. Your plate's looking more like a garden—colorful and real.",
    "You're almost there. The roots are strong, the colors are coming.",
    "Bright, balanced, and well-fed. That's the carrot energy we love to see.",
  ],
  img: '/assets/puzzles/puzzle_carrot.svg',
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
};

export const carrotColorOrder = [C1.color, C2.color, C3.color, C4.color,P1.color,F1.color,F2.color,F3.color,F4.color];
export default carrot; 