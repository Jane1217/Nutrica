const B = { color: '#F3F3EC', nutrient: 0 };
const C1 = { color: '#AF203E', nutrient: 1 }; // 碳水
const C2 = { color: '#821E38', nutrient: 1 }; // 碳水
const C3 = { color: '#5D1024', nutrient: 1 };
const C4 = { color: '#2D0711', nutrient: 1 };
const P1 = { color: '#ECB77B', nutrient: 2 }; 
const P2 = { color: '#EC6F46', nutrient: 2 }; 
const P3 = { color: '#D64042', nutrient: 2 }; // 蛋白
const F1 = { color: '#4AA152', nutrient: 3 }; // 脂肪
const F2 = { color: '#189A24', nutrient: 3 }; // 脂肪
const F3 = { color: '#1A5F20', nutrient: 3 };
const F4 = { color: '#09360D', nutrient: 3 };


const tomato = {
  id: 'tomato',
  name: 'Tomato',
  description: "Brimming with lycopene and main character energy.",
  descriptions: [
    "Still a green blob on the vine. Not quite salad material yet.",
    "Getting a little red in the cheeks. Someone’s blushing with nutrients!",
    "Juicy things are happening. You’re halfway to ketchup-level commitment.",
    "Looking ripe, tasting right. You’re basically sun-dried on the inside.",
    "Brimming with lycopene and main character energy.",
  ],
  img: '/assets/puzzles/puzzle_tomato.svg',
  inCollection: false,
  bgColor: '#FFCBC5',
  pixelMap: [
    // 1
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 2
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 3
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 4
    [B,B,B,B,B,B,B,B,B,B,B,F3,B,B,B,B,B,B,B,B,B,B,B,B],
    // 5
    [B,B,B,B,B,B,B,B,B,B,B,B,F3,B,B,F3,B,B,B,B,B,B,B,B],
    // 6
    [B,B,B,B,B,B,F3,F1,F1,F3,B,F3,F1,B,F3,F1,F3,B,B,B,B,B,B,B],
    // 7
    [B,B,B,B,B,F4,F4,F4,F3,F1,F2,F2,F3,F3,F1,F3,F4,F3,B,B,B,B,B,B],
    // 8
    [B,B,B,B,F3,B,B,B,B,F3,F1,F3,F1,F2,F3,F4,B,B,B,B,B,B,B,B],
    // 9
    [B,B,B,B,B,B,B,C3,F3,F3,F1,C2,C2,F4,F1,F3,B,B,B,B,B,B,B,B],
    // 10
    [B,B,B,B,B,B,C4,C2,C1,F4,C1,C1,C1,C2,C2,C2,C4,C4,B,B,B,B,B,B],
    // 11
    [B,B,B,B,B,C4,C2,C2,C1,C1,P3,P3,P3,C1,C1,C1,P3,P3,C4,B,B,B,B,B],
    // 12
    [B,B,B,B,C3,C3,C2,C2,C1,P3,P3,P3,P3,P3,P3,P3,P3,P3,P2,P3,B,B,B,B],
    // 13
    [B,B,B,B,C4,C3,C2,C2,C1,P3,P3,P3,P3,P3,P3,P3,P3,P1,P3,P3,B,B,B,B],
    // 14
    [B,B,B,B,C4,C3,C2,C2,C1,P3,P3,P3,P3,P3,P2,P3,P2,P2,P3,P3,B,B,B,B],
    // 15
    [B,B,B,B,C4,C3,C2,C2,C2,C1,P3,P3,P3,P3,P3,P3,P3,P3,P3,P3,B,B,B,B],
    // 16
    [B,B,B,B,C4,C3,C3,C2,C2,C2,C1,P3,P3,P3,P3,P3,P3,P3,P3,P3,B,B,B,B],
    // 17
    [B,B,B,B,C4,C3,C3,C3,C2,C2,C2,C1,C1,C1,C1,C1,C1,P3,P3,P3,B,B,B,B],
    // 18
    [B,B,B,B,B,C4,C2,C3,C3,C2,C2,C2,C2,C2,C2,C2,C2,C1,C1,B,B,B,B,B],
    // 19
    [B,B,B,B,B,B,C4,C2,C3,C3,C3,C2,C2,C2,C2,C2,C2,C2,B,B,B,B,B,B],
    // 20
    [B,B,B,B,B,B,B,C4,C2,C4,C4,C4,C3,C4,C2,C4,C4,B,B,B,B,B,B,B],
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

export const tomatoColorOrder = [C1.color, C2.color, C3.color, C4.color, P1.color, P2.color, P3.color, F1.color, F2.color, F3.color, F4.color];
export default tomato; 