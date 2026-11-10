#!/usr/bin/env node
// Checks a generated theme against the app's own puzzle logic and the puzzle rules.
//   node scripts/puzzle-generator/validate.mjs scripts/puzzle-generator/samples/breakfast_club
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getPuzzleProgress, getPuzzleNutrientColorsByOrder, getPuzzleProgressMessage } from '../../../frontend/src/utils/puzzles/progress.js';

// Product rule (frontend/src/utils/nutrition/nutrition.js): calories are split 50% carbs, 30% fats,
// 20% protein, so goal grams per kcal are 0.125 / 0.0333 / 0.05 -> 60% / 24% / 16% of goal grams.
const grams = { 1: 0.5 / 4, 2: 0.2 / 4, 3: 0.3 / 9 };
const gramTotal = grams[1] + grams[2] + grams[3];
const TARGET = { 1: grams[1] / gramTotal, 2: grams[2] / gramTotal, 3: grams[3] / gramTotal };
const SHARE_TOLERANCE = 0.06;
// No limit on the number of painted cells: a clear, detailed picture matters most. These only catch
// pictures that came out tiny or empty.
const MIN_CELLS = 100;
const MIN_EXTENT = 18;   // the picture should span at least this many of the 24 rows or columns

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const dir = path.resolve(process.cwd(), process.argv[2] || '');
const theme = JSON.parse(fs.readFileSync(path.join(dir, 'theme.json'), 'utf8'));
let failed = 0;
const problemsOf = [];

if (theme.puzzles.length !== theme.count) problemsOf.push(`theme says ${theme.count} puzzles but lists ${theme.puzzles.length}`);
if (new Set(theme.puzzles.map((p) => p.name.toLowerCase())).size !== theme.puzzles.length) problemsOf.push('duplicate puzzle names');
if (new Set(theme.puzzles.map((p) => p.slot)).size !== theme.puzzles.length) problemsOf.push('duplicate slots');
console.log(`theme "${theme.title}" (${theme.type}, ${theme.count} puzzles), target shares carbs/protein/fats ${[1, 2, 3].map((n) => TARGET[n].toFixed(2)).join('/')}`);
problemsOf.forEach((p) => { console.log(`FAIL theme: ${p}`); failed += 1; });

for (const entry of theme.puzzles) {
  const mod = await import(pathToFileURL(path.join(dir, `${entry.id}.js`)).href);
  const puzzle = mod.default;
  const order = Object.values(mod).find(Array.isArray);
  const problems = [];
  const rows = puzzle.pixelMap;
  const painted = rows.flat().filter((p) => p.nutrient);

  if (rows.length !== 24 || rows.some((r) => r.length !== 24)) problems.push('grid is not 24x24');
  if (puzzle.descriptions.length !== 5) problems.push('needs 5 progress messages');
  if (painted.length < MIN_CELLS) problems.push(`only ${painted.length} painted cells`);
  const usedRows = rows.map((r) => r.some((p) => p.nutrient)).filter(Boolean).length;
  const usedCols = [...Array(24).keys()].filter((x) => rows.some((r) => r[x].nutrient)).length;
  if (Math.max(usedRows, usedCols) < MIN_EXTENT) problems.push(`the picture spans only ${Math.max(usedRows, usedCols)} of 24 rows/columns`);

  const per = { 1: 0, 2: 0, 3: 0 };
  painted.forEach((p) => { per[p.nutrient] += 1; });
  for (const n of [1, 2, 3]) {
    if (per[n] === 0) problems.push(`no pixels for nutrient ${n}`);
    else if (Math.abs(per[n] / painted.length - TARGET[n]) > SHARE_TOLERANCE) {
      problems.push(`nutrient ${n} share ${(per[n] / painted.length).toFixed(2)} is not within ${SHARE_TOLERANCE} of ${TARGET[n].toFixed(2)}`);
    }
    if (getPuzzleNutrientColorsByOrder(rows, n, order).length === 0) problems.push(`no colours listed for nutrient ${n}`);
  }

  // a colour belongs to one nutrient only
  const nutrientOfColour = new Map();
  painted.forEach((p) => {
    if (nutrientOfColour.has(p.color) && nutrientOfColour.get(p.color) !== p.nutrient) problems.push(`colour ${p.color} is used by two nutrients`);
    nutrientOfColour.set(p.color, p.nutrient);
  });
  // protein = the darkest colours (outline / shadow), as in the hand-drawn puzzles
  const darkest = [...nutrientOfColour.keys()].sort((a, b) => luminance(a) - luminance(b))[0];
  if (nutrientOfColour.get(darkest) !== 2) problems.push('the darkest colour is not protein');

  const eps = 1e-9;
  if (getPuzzleProgress(puzzle, { 1: 1, 2: 1, 3: 1 }) < 1 - eps) problems.push('full nutrition does not complete the puzzle');
  if (getPuzzleProgress(puzzle, {}) !== 0) problems.push('empty progress is not 0');
  if (Math.abs(getPuzzleProgress(puzzle, { 1: 0.5, 2: 0.5, 3: 0.5 }) - 0.5) > 0.05) problems.push('half nutrition is not about half');
  if (!order || order.length !== nutrientOfColour.size) problems.push('colorOrder does not list every colour exactly once');
  getPuzzleProgressMessage(puzzle, { 1: 0.6, 2: 0.6, 3: 0.6 }, 'Tester');

  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${entry.slot}. ${puzzle.name.padEnd(16)} ${String(painted.length).padStart(3)} cells  carbs/protein/fats ${[1, 2, 3].map((n) => (per[n] / painted.length).toFixed(2)).join('/')}  ${nutrientOfColour.size} colours`);
  problems.forEach((p) => console.log(`       - ${p}`));
  if (problems.length) failed += 1;
}
process.exit(failed ? 1 : 0);
