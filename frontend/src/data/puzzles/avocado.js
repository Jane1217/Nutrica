// avocado.js
const B = { color: '#FFFFFF', nutrient: 0 };
const G1 = { color: '#A8E063', nutrient: 1 };
const G2 = { color: '#6BBF59', nutrient: 1 };
const G3 = { color: '#3A7D2C', nutrient: 1 };
const BROWN = { color: '#7C4F20', nutrient: 2 };
const YELLOW = { color: '#F9E79F', nutrient: 3 };

const avocado = {
  id: 'avocado',
  name: 'Avocado',
  description: "Peak avo achieved. Someone grab the toast!",
  descriptions: [
    "Not even guac-worthy yet. Let’s get this avocado rolling.",
    "Slightly squishy. You’re on your way to snackable greatness.",
    "Half an avo is still better than none. Keep mashing forward.",
    "Almost ripe enough to ghost someone at brunch. One more bite!",
    "Peak avo achieved. Someone grab the toast!",
  ],
  img: '/assets/puzzles/puzzle_avocado.svg',
  inCollection: false,
  bgColor: '#9ED987',
  pixelMap: [
    // 24x24数组，示例：
    [B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B,B],
    // ... 其余行 ...
  ]
};

export const avocadoColorOrder = [G1.color, G2.color, G3.color, BROWN.color, YELLOW.color];
export default avocado; 