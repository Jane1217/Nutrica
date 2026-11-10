#!/usr/bin/env node
// Checks generated puzzle files against the app's own puzzle logic (frontend/src/utils/puzzles/progress.js).
//   node scripts/puzzle-generator/validate.mjs samples/banana.js samples/egg.js
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { getPuzzleProgress, getPuzzleNutrientColorsByOrder, getPuzzleProgressMessage } from '../../../frontend/src/utils/puzzles/progress.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const files = process.argv.slice(2);
let failed = 0;

for (const file of files) {
  const mod = await import(pathToFileURL(path.resolve(here, '..', '..', file)).href);
  const puzzle = mod.default;
  const order = Object.values(mod).find(Array.isArray);
  const problems = [];
  const rows = puzzle.pixelMap;

  if (rows.length !== 24 || rows.some((r) => r.length !== 24)) problems.push('grid is not 24x24');
  if (rows.flat().some((p) => !p || typeof p.color !== 'string' || ![0, 1, 2, 3].includes(p.nutrient))) problems.push('bad cell');
  if (puzzle.descriptions.length !== 5) problems.push('needs 5 progress messages');

  const per = { 1: 0, 2: 0, 3: 0 };
  rows.flat().forEach((p) => { if (p.nutrient) per[p.nutrient] += 1; });
  for (const n of [1, 2, 3]) {
    if (per[n] === 0) problems.push(`no pixels for nutrient ${n}`);
    if (getPuzzleNutrientColorsByOrder(rows, n, order).length === 0) problems.push(`no colours listed for nutrient ${n}`);
  }
  const eps = 1e-9;
  if (getPuzzleProgress(puzzle, { 1: 1, 2: 1, 3: 1 }) < 1 - eps) problems.push('full nutrition does not complete the puzzle');
  if (getPuzzleProgress(puzzle, {}) !== 0) problems.push('empty progress is not 0');
  const half = getPuzzleProgress(puzzle, { 1: 0.5, 2: 0.5, 3: 0.5 });
  if (Math.abs(half - 0.5) > 0.05) problems.push(`half progress is ${half.toFixed(2)}`);
  const colours = new Set(rows.flat().filter((p) => p.nutrient).map((p) => p.color));
  if (!order || order.length !== colours.size) problems.push('colorOrder does not list every colour exactly once');

  const msg = getPuzzleProgressMessage(puzzle, { 1: 0.6, 2: 0.6, 3: 0.6 }, 'Tester');
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${puzzle.id}: ${per[1] + per[2] + per[3]} pixels (carbs ${per[1]}, protein ${per[2]}, fats ${per[3]}), ${colours.size} colours, progress message at 60%: "${msg}"`);
  problems.forEach((p) => console.log(`       - ${p}`));
  if (problems.length) failed += 1;
}
process.exit(failed ? 1 : 0);
