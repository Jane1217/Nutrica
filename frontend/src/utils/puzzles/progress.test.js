import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findPuzzleById,
  getPuzzleNutrientColorsByOrder,
  getPuzzleProgress,
  getPuzzleProgressMessage,
} from './progress.js';

const puzzle = {
  id: 'carrot',
  description: 'Fallback description',
  descriptions: ['Start', 'Quarter', 'Half', 'Nearly done', 'Almost complete'],
  pixelMap: [
    [{ nutrient: 1, color: 'orange' }, { nutrient: 1, color: 'green' }],
    [{ nutrient: 2, color: 'purple' }, { nutrient: 0, color: 'background' }],
  ],
};

test('calculates progress by nutrient pixels using the existing rounding rule', () => {
  assert.equal(getPuzzleProgress(puzzle, { 1: 0.5, 2: 1 }), 2 / 3);
  assert.equal(getPuzzleProgress({ pixelMap: [] }, {}), 0);
});

test('returns only colors present in the requested nutrient and preserves display order', () => {
  assert.deepEqual(
    getPuzzleNutrientColorsByOrder(puzzle.pixelMap, 1, ['green', 'purple', 'orange']),
    ['green', 'orange'],
  );
});

test('selects resilient progress copy and finds a puzzle from catalog categories', () => {
  assert.equal(getPuzzleProgressMessage(null, {}, 'Alex'), 'Hey Alex! Ready to collect today’s nutrition puzzle?');
  assert.equal(getPuzzleProgressMessage(puzzle, { 1: 1, 2: 1 }), 'Puzzle collected! Treat yourself in tomorrow’s challenge!');
  assert.equal(findPuzzleById('carrot', [{ puzzles: [puzzle] }]), puzzle);
  assert.equal(findPuzzleById('missing', [{ puzzles: [puzzle] }]), null);
});
