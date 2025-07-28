// avocado.js
const B = { color: '#F3F3EC', nutrient: 0 };
const C1 = { color: '#AE6251', nutrient: 1 }; // 碳水
const C2 = { color: '#6D3023', nutrient: 1 }; // 碳水
const C3 = { color: '#333A18', nutrient: 1 };
const C4 = { color: '#191D0C', nutrient: 1 };
const C5 = { color: '#49241C', nutrient: 1 }; // 碳水
const P = { color: '#F7F086', nutrient: 2 }; // 蛋白
const F = { color: '#B6C63F', nutrient: 3 }; // 脂肪

const pumpkin = {
  id: 'pumpkin',
  name: 'Pumpkin',
  description: "All florets firing. Green power has officially peaked",
  descriptions: [
    "Just a tiny floret with big green dreams. Don’t fear the crunch.",
    "Starting to look less like a houseplant, more like dinner.",
    "Halfway to full florets. Kinda healthy, kinda heroic.",
    "Looking steamed, but in a good way. Almost plate-ready!",
    "All florets firing. Green power has officially peaked!",
  ],
  img: '/assets/puzzles/puzzle_pumpkin.svg',
  inCollection: false,
  bgColor: '#F6CD8C',
  pixelMap: [
    // 1
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 2
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 3
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 4
    [B,B,B,B,B,B,C3,C3,C3,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 5
    [B,B,B,B,B,C3,F,F,F,C3,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 6
    [B,B,B,B,C3,C3,F,P,P,F,C3,C3,B,B,B,B,B,B,B,B,B,B,B,B],
    // 7
    [B,B,B,B,C3,C3,F,P,P,P,F,F,C3,C3,B,B,B,B,B,B,B,B,B,B],
    // 8
    [B,B,B,C3,C3,C3,F,P,P,P,P,F,F,C3,C3,B,B,B,B,B,B,B,B,B],
    // 9
    [B,B,B,C3,C3,C3,F,P,P,P,P,P,P,P,F,F,C3,B,B,B,B,B,B,B],
    // 10
    [B,B,B,C4,C3,C3,C3,F,P,P,P,P,P,P,P,P,F,C3,B,B,B,B,B,B],
    // 11
    [B,B,B,C4,C3,C3,C3,F,P,P,P,P,P,C2,C1,P,P,F,C3,B,B,B,B,B],
    // 12
    [B,B,B,B,C4,C3,C3,C3,F,P,P,P,C2,C2,C2,C1,P,P,F,C3,B,B,B,B],
    // 13
    [B,B,B,B,C4,C3,C3,C3,F,P,P,P,C2,C2,C2,C2,C1,P,F,C3,B,B,B,B],
    // 14
    [B,B,B,B,B,C4,C3,C3,F,F,P,P,C2,C2,C2,C2,C1,P,P,F,C3,B,B,B],
    // 15
    [B,B,B,B,B,C4,C3,C3,C3,F,P,P,P,C5,C2,C2,C2,P,P,F,C3,B,B,B],
    // 16
    [B,B,B,B,B,C4,C3,C3,C3,F,F,P,P,P,C5,C5,P,P,P,F,C3,B,B,B],
    // 17
    [B,B,B,B,B,B,C4,C3,C3,C3,F,F,P,P,P,P,P,P,F,F,C3,B,B,B],
    // 18
    [B,B,B,B,B,B,B,C4,C3,C3,C3,F,F,P,P,P,P,F,F,C3,B,B,B,B],
    // 19
    [B,B,B,B,B,B,B,C4,C4,C3,C3,C3,F,F,F,F,F,F,C3,B,B,B,B,B],
    // 20
    [B,B,B,B,B,B,B,B,B,C4,C4,C3,C3,C3,C3,C3,C3,C4,B,B,B,B,B,B],
    // 21
    [B,B,B,B,B,B,B,B,B,B,C4,C4,C4,C4,C4,C4,C4,B,B,B,B,B,B,B],
    // 22
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 23
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 24
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
  ]  
};

export const pumpkinColorOrder = [C1.color, C2.color, C3.color, C4.color, C5.color, P.color, F.color];
export default pumpkin; 