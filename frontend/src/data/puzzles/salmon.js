// salmon.js
const B = { color: '#F3F3EC', nutrient: 0 };
const C1 = { color: '#FFF5DD', nutrient: 1 }; // 碳水
const C2 = { color: '#FFCAAC', nutrient: 1 }; // 碳水
const C3 = { color: '#F96D33', nutrient: 1 }; // 碳水
const C4 = { color: '#E74B18', nutrient: 1 }; // 碳水
const C5 = { color: '#A51903', nutrient: 1 }; // 碳水

const P = { color: '#08070C', nutrient: 2 }; // 蛋白

const F1 = { color: '#AEC2BD', nutrient: 3 }; // 脂肪
const F2 = { color: '#648C8B', nutrient: 3 }; // 脂肪

const salmon = {
  id: 'salmon',
  name: 'Salmon',
  description: "Precision, poise, and a blush of pink. The salmon stands nearly whole.",
  descriptions: [
    "Just a translucent whisper of protein. Still waiting to be sliced into greatness.",
    "The marbling’s waking up. A little swirl, a little chill, a little wow.",
    "Half sashimi, half suggestion. Still slippery, still mysterious.",
    "Pink, plump, and nearly ceremonial. Soy sauce is watching closely.",
    "Precision, poise, and a blush of pink. The salmon stands nearly whole.",
  ],
  img: '/assets/puzzles/puzzle_salmon.svg',
  inCollection: false,
  bgColor: '#FBD891',
  pixelMap: [
    // 1
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 2
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 3
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // 4
    [B,B,B,B,B,B,B,B,B,B,B,B,B,P,P,P,B,B,B,B,B,B,B,B],
    // 5
    [B,B,B,B,B,B,B,B,B,B,B,P,P,C2,C2,C4,P,B,B,B,B,B,B,B],
    // 6
    [B,B,B,B,B,B,B,B,B,P,P,C2,C3,C3,C4,C2,C2,P,B,B,B,B,B,B],
    // 7
    [B,B,B,B,B,B,B,B,P,C2,C3,C3,C3,C3,C2,C3,C3,C2,P,B,B,B,B,B],
    // 8
    [B,B,B,B,B,B,B,P,C2,C3,C3,C3,C3,C2,C3,C3,C3,C2,P,B,B,B,B,B],
    // 9
    [B,B,B,B,B,B,P,C2,C2,C3,C3,C3,C2,C3,C3,C3,C3,C2,P,B,B,B,B,B],
    // 10
    [B,B,B,B,B,P,C2,C4,C3,C2,C3,C1,C2,C4,C4,C3,C3,C2,P,B,B,B,B,B],
    // 11
    [B,B,B,B,B,P,C2,C3,C3,C3,C1,C1,C1,C3,C2,C3,C2,F2,P,B,B,B,B,B],
    // 12
    [B,B,B,B,B,P,C3,C3,C3,C3,C1,C1,C3,C3,C3,C2,C2,F2,P,B,B,B,B,B],
    // 13
    [B,B,B,B,P,C4,C4,C3,C2,C5,C5,C3,C2,C4,C4,C2,F2,P,B,B,B,B,B,B],
    // 14
    [B,B,B,B,P,C3,C3,C2,C5,C5,C2,C3,C3,C2,C2,F2,F2,P,B,B,B,B,B,B],
    // 15
    [B,B,B,B,P,C2,C2,C5,C5,C2,C3,C3,C2,C2,F2,F2,P,B,B,B,B,B,B,B],
    // 16
    [B,B,B,B,P,C2,C5,C5,P,C3,C3,C2,F2,F2,F2,P,B,B,B,B,B,B,B,B],
    // 17
    [B,B,B,B,P,F1,C5,P,C2,C3,C2,F2,F2,P,P,B,B,B,B,B,B,B,B,B],
    // 18
    [B,B,B,B,P,F2,P,P,C2,C2,F1,F2,P,B,B,B,B,B,B,B,B,B,B,B],
    // 19
    [B,B,B,B,B,P,P,P,F1,F1,F1,P,B,B,B,B,B,B,B,B,B,B,B,B],
    // 20
    [B,B,B,B,B,B,B,P,P,P,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
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

export const salmonColorOrder = [C1.color, C2.color, C3.color, C4.color, C5.color, P.color, F1.color, F2.color];
export default salmon; 