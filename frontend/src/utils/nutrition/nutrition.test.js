import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateNutritionFromCalories,
  calculateNutritionProgress,
  getNutritionPercentage,
} from './nutrition.js';

test('calculates macro targets from valid calorie goals and clamps invalid values', () => {
  assert.deepEqual(calculateNutritionFromCalories(2000), {
    carbs: 250,
    fats: 67,
    protein: 100,
  });
  assert.deepEqual(calculateNutritionFromCalories(-10), {
    carbs: 0,
    fats: 0,
    protein: 0,
  });
});

test('creates finite, capped nutrient progress for incomplete or invalid goals', () => {
  assert.deepEqual(
    calculateNutritionProgress(
      { carbs: 150, protein: 300, fats: -5 },
      { carbs: 100, protein: 150, fats: 0 },
    ),
    { 1: 1, 2: 1, 3: 0 },
  );
  assert.equal(getNutritionPercentage(-20, 100), 0);
  assert.equal(getNutritionPercentage(20, 0), 0);
});
