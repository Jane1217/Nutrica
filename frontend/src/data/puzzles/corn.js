// avocado.js
const B = { color: '#F3F3EC', nutrient: 0 };
const C1 = { color: '#FCDA5B', nutrient: 1 }; // 碳水
const C2 = { color: '#FEBE5D', nutrient: 1 }; // 碳水
const C3 = { color: '#F6A427', nutrient: 1 };
const C4 = { color: '#DF742C', nutrient: 1 };
const C5 = { color: '#AF4D0B', nutrient: 1 };
const P1 = { color: '#3FB753', nutrient: 2 }; 
const P2 = { color: '#77B73F', nutrient: 2 }; // 蛋白
const P3 = { color: '#2B8E3B', nutrient: 2 }; // 蛋白
const P4 = { color: '#0F5F1C', nutrient: 2 }; 
const F1 = { color: '#69412D', nutrient: 3 }; // 脂肪
const F2 = { color: '#3D1B0A', nutrient: 3 }; // 脂肪

const corn = {
  id: 'corn',
  name: 'Corn',
  description: "Fully golden, slightly dramatic. Basically one microwave from stardom.",
  descriptions: [
    "This cob’s got potential—you just can’t taste it yet.",
    "A few kernels are starting to believe. You’re heating up!",
    "Halfway to golden glory. Keep it corny, in the best way.",
    "You’re getting butter-worthy. This cob’s got confidence.",
    "Fully golden, slightly dramatic. Basically one microwave from stardom.",
  ],
  img: '/assets/puzzles/puzzle_corn.svg',

  bgColor: '#F6E78C',
  pixelMap: [
    // 1
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 2
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 3
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 4
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,C4,C4,C4,B,B,B,B,B,B,B],
    // 5
    [B,B,B,B,B,B,B,B,B,B,B,B,C5,C4,C2,C4,C2,C4,B,B,B,B,B,B],
    // 6
    [B,B,B,B,B,B,B,B,B,F2,B,C5,C2,C2,C4,C2,C1,C4,B,B,B,B,B,B],
    // 7
    [B,B,B,B,B,B,B,B,F2,F2,F2,C3,C2,C1,C2,C4,C3,C4,B,B,B,B,B,B],
    // 8
    [B,B,B,B,B,F2,B,B,F2,F1,C4,C3,C4,C4,C2,C3,C3,C4,B,B,B,B,B,B],
    // 9
    [B,B,B,B,B,B,F2,B,F2,F1,C4,C3,C2,C1,C2,C2,C1,C5,B,B,B,B,B,B],
    // 10
    [B,B,B,B,B,P3,P1,F2,F1,C4,C3,C4,C4,C2,C2,C2,C5,B,B,B,B,B,B,B],
    // 11
    [B,B,B,B,B,B,P3,F2,C4,C3,C3,C2,C1,C4,C2,C4,C4,B,B,B,B,B,B,B],
    // 12
    [B,B,B,B,B,B,P2,P1,F2,C3,C3,C4,C4,C2,C2,C1,F2,F2,F1,B,B,B,B,B],
    // 13
    [B,B,B,B,B,B,P4,P3,P3,C3,C2,C2,C1,C2,C4,C4,F2,F1,B,B,B,B,B,B],
    // 14
    [B,B,B,B,B,B,P4,P3,P2,C3,C4,C4,C2,C3,C3,F2,F1,B,B,B,B,B,B,B],
    // 15
    [B,B,B,B,B,P4,P3,P2,F2,C3,C3,C3,C2,C3,F2,F2,P1,P1,P3,B,B,B,B,B],
    // 16
    [B,B,B,B,B,P4,P3,P2,F2,C3,C5,C2,F2,F1,P3,P3,F1,F1,P3,P1,B,B,B,B],
    // 17
    [B,B,B,B,B,P4,P3,P1,F2,C5,P2,P1,P1,P1,F2,F2,B,B,B,B,B,B,B,B],
    // 18
    [B,B,B,B,B,P4,P3,P3,P1,P3,P3,P3,P3,F2,B,B,B,B,B,B,B,B,B,B],
    // 19
    [B,B,B,B,B,P4,P4,P3,P3,P3,P3,P2,F2,B,B,B,B,B,B,B,B,B,B,B],
    // 20
    [B,B,B,B,B,B,P4,P4,P4,P4,P2,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 21
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 22
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 23
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 24
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
  ]    
};

export const cornColorOrder = [C1.color, C2.color, C3.color, C4.color, C5.color, P1.color, P2.color, P3.color, P4.color, F1.color, F2.color];
export default corn; 