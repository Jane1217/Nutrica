const {
  extractFirstEmoji,
  estimateCalories,
  calorieMismatch,
  isLikelyMisread
} = require('../src/utils/nutritionLabel');

describe('extractFirstEmoji', () => {
  test.each([
    ['🥣', '🥣'],
    [' 🍕 yum', '🍕'],
    ['👍🏽', '👍🏽'],
    ['❤️', '❤️']
  ])('extracts %p', (input, expected) => {
    expect(extractFirstEmoji(input)).toBe(expected);
  });

  test.each([['1'], ['pizza'], [''], [null], [undefined], [42]])(
    'returns null for non-emoji input %p (digits are not emoji)',
    (input) => {
      expect(extractFirstEmoji(input)).toBeNull();
    }
  );
});

describe('label consistency check', () => {
  test('estimates energy with Atwater factors', () => {
    expect(estimateCalories({ carbs: 10, fats: 2, protein: 3 })).toBe(70);
  });

  test('accepts an ordinary label (rounding, fibre)', () => {
    // 4*27 + 9*3 + 4*5 = 155, printed 150
    expect(isLikelyMisread({ calories: 150, carbs: 27, fats: 3, protein: 5 })).toBe(false);
  });

  test('accepts an all-zero label', () => {
    expect(isLikelyMisread({ calories: 0, carbs: 0, fats: 0, protein: 0 })).toBe(false);
  });

  test('accepts tiny values within rounding slack', () => {
    expect(isLikelyMisread({ calories: 5, carbs: 1, fats: 0, protein: 0 })).toBe(false);
  });

  test('flags a misread digit', () => {
    // printed 900 but macros only add up to 70
    expect(isLikelyMisread({ calories: 900, carbs: 10, fats: 2, protein: 3 })).toBe(true);
  });

  test('mismatch ratio orders reads by consistency', () => {
    const bad = { calories: 900, carbs: 10, fats: 2, protein: 3 };
    const good = { calories: 70, carbs: 10, fats: 2, protein: 3 };
    expect(calorieMismatch(good)).toBeLessThan(calorieMismatch(bad));
    expect(calorieMismatch(good)).toBe(0);
  });
});
