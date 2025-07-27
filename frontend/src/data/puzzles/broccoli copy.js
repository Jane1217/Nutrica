// avocado.js
const B = { color: '#F3F3EC', nutrient: 0 };
const C1 = { color: '#25AD2E', nutrient: 1 }; // 碳水
const C2 = { color: '#23892A', nutrient: 1 }; // 碳水

const P1 = { color: '#A6EA4E', nutrient: 2 }; // 蛋白
const P2 = { color: '#82C42C', nutrient: 2 }; // 蛋白

const F = { color: '#102611', nutrient: 3 }; // 脂肪

const broccoli = {
  id: 'broccoli',
  name: 'Broccoli',
  description: "All florets firing. Green power has officially peaked",
  descriptions: [
    "Just a tiny floret with big green dreams. Don’t fear the crunch.",
    "Starting to look less like a houseplant, more like dinner.",
    "Halfway to full florets. Kinda healthy, kinda heroic.",
    "Looking steamed, but in a good way. Almost plate-ready!",
    "All florets firing. Green power has officially peaked!",
  ],
  img: '/assets/puzzles/puzzle_broccoli.svg',
  inCollection: false,
  bgColor: '#C7F58C',
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
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,F,F,B,B,B,B,B,B,B,B],
    // 6
    [B,B,B,B,B,B,B,B,B,F,F,F,B,F,C1,C1,F,B,B,B,B,B,B,B],
    // 7
    [B,B,B,B,B,B,B,B,F,C1,C1,C1,F,C1,C1,C1,C1,F,B,B,B,B,B,B],
    // 8
    [B,B,B,B,B,B,F,F,C1,F,C2,C1,C1,C2,C2,C2,C1,F,B,B,B,B,B,B],
    // 9
    [B,B,B,B,B,F,C1,C1,C1,C1,F,C2,C2,C2,C2,C2,C2,C2,F,B,B,B,B,B,B],
    // 10
    [B,B,B,B,F,C1,C2,C2,F,F,F,F,C2,C2,C1,C2,F,F,B,B,B,B,B,B],
    // 11
    [B,B,B,B,F,C2,C2,F,C1,C1,C1,C1,F,C1,F,F,C1,C1,F,B,B,B,B,B],
    // 12
    [B,B,B,B,B,F,F,C1,C1,C2,C2,C1,F,F,C1,C1,C2,C2,C1,F,B,B,B,B],
    // 13
    [B,B,B,B,B,B,B,F,C2,C2,C2,C2,C2,F,C1,C1,C2,C2,C2,F,B,B,B,B],
    // 14
    [B,B,B,B,B,B,B,F,F,C2,C2,F,F,C1,C2,C2,C2,C2,C2,F,B,B,B,B,B],
    // 15
    [B,B,B,B,B,B,F,P1,F,F,C2,F,F,C1,C1,F,F,F,B,B,B,B,B,B],
    // 16
    [B,B,B,B,B,F,P1,F,B,F,C2,F,F,F,F,C1,C2,F,B,B,B,B,B,B],
    // 17
    [B,B,B,B,B,F,P2,F,P1,P2,F,B,F,C1,C1,C2,F,B,B,B,B,B,B,B],
    // 18
    [B,B,B,B,F,P1,P2,P1,P2,F,B,B,B,F,F,F,F,B,B,B,B,B,B,B],
    // 19
    [B,B,B,B,F,P2,P2,P2,F,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 20
    [B,B,B,B,B,F,P2,F,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
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

export const broccoliColorOrder = [C1.color, C2.color, P1.color, P2.color, F.color];
export default broccoli; 