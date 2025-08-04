// avocado.js
const B = { color: '#F3F3EC', nutrient: 0 };
const C1 = { color: '#FF8446', nutrient: 1 }; // 碳水
const C2 = { color: '#F26835', nutrient: 1 }; // 碳水
const C3 = { color: '#E1501F', nutrient: 1 }; // 碳水
const C4 = { color: '#BE3B10', nutrient: 1 }; // 碳水

const P1 = { color: '#39976C', nutrient: 2 }; // 蛋白
const P2 = { color: '#216848', nutrient: 2 }; // 蛋白
const P3 = { color: '#0B5634', nutrient: 2 }; // 蛋白

const F = { color: '#2D0711', nutrient: 3 }; // 脂肪

const pumpkin = {
  id: 'pumpkin',
  name: 'Pumpkin',
  description: "Plump, proud, and ready to be the main dish or the main event.",
  descriptions: [
    "It’s not a pumpkin yet. It’s a whisper of one.",
    "A tiny sprout with big gourd dreams.",
    "Half a pumpkin, still unsure if it’s soup or Halloween.",
    "Starting to glow—this squash is getting serious.",
    "Plump, proud, and ready to be the main dish or the main event.",
  ],
  img: '/assets/puzzles/puzzle_pumpkin.svg',
  bgColor: '#FACAB2',
  pixelMap: [
    // 1
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 2
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 3
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 4
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 5
    [B,B,B,B,B,B,B,B,B,B,B,B,P2,P2,P3,B,B,B,B,B,B,B,B,B],
    // 6
    [B,B,B,B,B,B,B,B,B,B,B,P1,P2,B,P3,B,B,B,B,B,B,B,B,B],
    // 7
    [B,B,B,B,B,B,B,B,B,B,B,P1,P3,B,B,B,B,B,B,B,B,B,B,B],
    // 8
    [B,B,B,B,B,B,B,C3,C3,C3,P1,P2,P2,P2,C3,C3,C3,B,B,B,B,B,B,B],
    // 9
    [B,B,B,B,B,C3,C3,F,F,P2,P1,P2,P2,P2,P2,F,F,F,C3,B,B,B,B,B],
    // 10
    [B,B,B,B,C4,C3,C1,C1,C2,F,C2,C2,C2,C2,F,C1,C1,C1,C1,C3,B,B,B,B],
    // 11
    [B,B,B,B,C4,C3,C1,C2,C4,C1,C2,C2,C2,C1,C1,C4,C1,C1,C3,C4,B,B,B,B],
    // 12
    [B,B,B,B,C4,C3,C1,C2,C3,C1,C2,C2,C2,C2,C1,C3,C1,C1,C2,C4,B,B,B,B],
    // 13
    [B,B,B,B,C4,C3,C2,C2,C3,C1,C2,C2,C2,C2,C2,C3,C2,C2,C2,C4,B,B,B,B],
    // 14
    [B,B,B,B,C4,C3,C3,C3,C3,C1,C2,C3,C3,C3,C1,C3,C2,C2,C3,C4,B,B,B,B],
    // 15
    [B,B,B,B,C4,C3,C3,C3,C3,C1,C3,C3,C3,C3,C3,C3,C3,C2,C3,C4,B,B,B,B],
    // 16
    [B,B,B,B,C4,C3,C3,C3,C4,C3,C3,C3,C3,C3,C3,C4,C3,C2,C3,C4,B,B,B,B],
    // 17
    [B,B,B,B,F,C3,C3,C3,C4,C3,C3,C3,C3,C3,C3,C4,C3,C3,C3,F,B,B,B,B],
    // 18
    [B,B,B,B,F,C3,C3,C3,C4,C3,C3,C3,C3,C3,C3,C4,C3,C3,C3,F,B,B,B,B],
    // 19
    [B,B,B,B,B,F,F,C3,C3,C4,C3,C3,C3,C3,C4,C3,C3,F,F,B,B,B,B,B],
    // 20
    [B,B,B,B,B,B,B,F,F,F,F,F,F,F,F,F,F,B,B,B,B,B,B,B],
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

export const pumpkinColorOrder = [C1.color, C2.color, C3.color, C4.color, P1.color, P2.color, P3.color, F.color];
export default pumpkin; 