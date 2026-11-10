import test from 'node:test';
import assert from 'node:assert/strict';
import { expandGeneratedPuzzle, isValidGeneratedPuzzle, buildPuzzleSvgUrl } from './generated.js';
import { getPuzzleProgress, getPuzzleNutrientColorsByOrder } from './progress.js';

const row = () => {
  const grid = Array.from({ length: 24 }, () => Array(24).fill(-1));
  grid[10][10] = 0; grid[10][11] = 0;   // two carb cells
  grid[11][10] = 1;                     // one protein cell
  grid[11][11] = 2; grid[11][12] = 2;   // two fat cells
  return {
    id: 'ai_test',
    name: 'Test',
    description: 'done',
    descriptions: ['a', 'b', 'c', 'd', 'e'],
    bg_color: '#FEF6AA',
    palette: [
      { color: '#FF9F58', nutrient: 1 },
      { color: '#3B0E09', nutrient: 2 },
      { color: '#98E673', nutrient: 3 },
    ],
    grid,
  };
};

test('expands the compact row into the same shape as the hand-drawn puzzles', () => {
  const { puzzle, colorOrder } = expandGeneratedPuzzle(row());
  assert.equal(puzzle.id, 'ai_test');
  assert.equal(puzzle.pixelMap.length, 24);
  assert.deepEqual(puzzle.pixelMap[0][0], { color: '#F3F3EC', nutrient: 0 });
  assert.deepEqual(puzzle.pixelMap[10][10], { color: '#FF9F58', nutrient: 1 });
  assert.deepEqual(colorOrder, ['#FF9F58', '#3B0E09', '#98E673']);
  assert.equal(puzzle.bgColor, '#FEF6AA');
  assert.ok(puzzle.img.startsWith('data:image/svg+xml'));
});

test('the expanded puzzle works with the app progress logic', () => {
  const { puzzle, colorOrder } = expandGeneratedPuzzle(row());
  assert.equal(getPuzzleProgress(puzzle, { 1: 1, 2: 1, 3: 1 }), 1);
  assert.equal(getPuzzleProgress(puzzle, {}), 0);
  assert.deepEqual(getPuzzleNutrientColorsByOrder(puzzle.pixelMap, 3, colorOrder), ['#98E673']);
});

test('rejects malformed rows instead of breaking the app', () => {
  const bad = [
    null,
    { ...row(), id: undefined },
    { ...row(), descriptions: ['only one'] },
    { ...row(), palette: [] },
    { ...row(), palette: [{ color: 'red', nutrient: 1 }] },
    { ...row(), palette: [{ color: '#FFFFFF', nutrient: 9 }] },
    { ...row(), grid: row().grid.slice(1) },
    { ...row(), grid: row().grid.map((line) => line.slice(1)) },
    { ...row(), grid: row().grid.map((line) => line.map(() => 99)) },
  ];
  bad.forEach((item) => {
    assert.equal(isValidGeneratedPuzzle(item), false);
    assert.equal(expandGeneratedPuzzle(item), null);
  });
});

test('the artwork svg only contains painted cells', () => {
  const r = row();
  const url = buildPuzzleSvgUrl(r.palette, r.grid);
  const svg = decodeURIComponent(url.split(',')[1]);
  assert.equal((svg.match(/<rect /g) || []).length, 5);
  assert.ok(svg.includes('fill="#98E673"'));
});
