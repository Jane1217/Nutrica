#!/usr/bin/env node
// Checks a generated theme against the app's own puzzle logic and the puzzle rules.
//   node scripts/puzzle-generator/validate.mjs scripts/puzzle-generator/samples/breakfast_club
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getPuzzleProgress, getPuzzleNutrientColorsByOrder, getPuzzleProgressMessage } from '../../../frontend/src/utils/puzzles/progress.js';

// Product rule (frontend/src/utils/nutrition/nutrition.js): calories are split 50% carbs, 30% fats, 20% protein,
// and pixels are shared out the same way (nutrient 1 carbs, 2 protein, 3 fats).
const TARGET = { 1: 0.5, 2: 0.2, 3: 0.3 };
// Each nutrient is one colour family (a few shades of one hue), so the shares cannot be tuned colour by colour:
// the hand-drawn puzzles themselves range from 40% to 79% carbs. Generated ones must land within this of the split.
const SHARE_TOLERANCE = 0.10;
const MAX_HUE_SPREAD = 40;      // degrees: coloured shades inside one nutrient must be the same hue family
const MAX_SCATTER = 0.2;       // hand-drawn puzzles score 0.03-0.17 (see fill scatter in pixelate.py)
// No limit on the number of painted cells: a clear, detailed picture matters most. These only catch
// pictures that came out tiny or empty.
const MIN_CELLS = 100;
const MIN_EXTENT = 18;   // the picture should span at least this many of the 24 rows or columns

const rgbOf = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
// hue in degrees, or null for greys and near-black/white colours (no meaningful hue)
const hueOf = (hex) => {
  const [r, g, b] = rgbOf(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (max < 0.25 || d / max < 0.25) return null;
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
};
const circularSpread = (hues) => {
  const sorted = [...hues].sort((a, b) => a - b);
  let widestGap = sorted[0] + 360 - sorted[sorted.length - 1];
  for (let i = 1; i < sorted.length; i += 1) widestGap = Math.max(widestGap, sorted[i] - sorted[i - 1]);
  return 360 - widestGap;
};

// How far the app's fill is from a clean bottom-to-top fill (same measure as fill_scatter in pixelate.py):
// the app fills each nutrient on its own, bottom row first, so the picture only fills evenly if each nutrient's
// cells are spread over the same heights.
const MIXES = [[.3, .3, .3], [.5, .5, .5], [.7, .7, .7], [.5, .3, .7], [.3, .7, .5], [.7, .5, .3], [.6, .4, .5]];
const fillScatter = (rows) => {
  const order = { 1: [], 2: [], 3: [] };
  for (let y = 23; y >= 0; y -= 1) for (let x = 0; x < 24; x += 1) if (rows[y][x].nutrient) order[rows[y][x].nutrient].push(y);
  const scores = [];
  for (const mix of MIXES) {
    const filled = Array(24).fill(0);
    const empty = Array(24).fill(0);
    [1, 2, 3].forEach((n, k) => {
      const take = Math.round(order[n].length * mix[k]);
      order[n].forEach((y, j) => { (j < take ? filled : empty)[y] += 1; });
    });
    const f = filled.reduce((a, b) => a + b, 0);
    const e = empty.reduce((a, b) => a + b, 0);
    if (!f || !e) continue;
    let inversions = 0;
    for (let a = 0; a < 24; a += 1) for (let b = a + 1; b < 24; b += 1) inversions += filled[a] * empty[b];
    scores.push(inversions / (f * e));
  }
  return scores.reduce((a, b) => a + b, 0) / scores.length;
};

const dir = path.resolve(process.cwd(), process.argv[2] || '');
const theme = JSON.parse(fs.readFileSync(path.join(dir, 'theme.json'), 'utf8'));
let failed = 0;
const problemsOf = [];

// Copy follows the hand-drawn themes (frontend/src/data/puzzles): short, witty, no emoji, no generic cheering.
const EMOJI = /\p{Extended_Pictographic}/u;
const CLICHE = /great job|keep going|keep it up|almost there|so close/i;
const copyProblems = (label, text, min, max) => {
  const out = [];
  if (text.length < min || text.length > max) out.push(`${label} is ${text.length} characters, expected ${min}-${max}: "${text}"`);
  if (EMOJI.test(text)) out.push(`${label} contains an emoji`);
  if (CLICHE.test(text)) out.push(`${label} uses a generic cheer: "${text}"`);
  return out;
};

if (!/^#[0-9A-Fa-f]{6}$/.test(theme.bg_color || '')) problemsOf.push('theme has no valid bg_color');
problemsOf.push(...copyProblems('theme description', theme.description, 100, 170));
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
  problems.push(...copyProblems('completion line', puzzle.description, 40, 72));
  puzzle.descriptions.forEach((d, i) => problems.push(...copyProblems(`message ${i + 1}`, d, 36, 85)));
  if ((puzzle.descriptions.join(' ').match(/!/g) || []).length + (puzzle.description.match(/!/g) || []).length > 1) problems.push('too many exclamation marks');
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
  // each nutrient is one colour family, like the hand-drawn puzzles (carrot: orange reds / dark brown / greens)
  for (const n of [1, 2, 3]) {
    const hues = [...nutrientOfColour].filter(([, v]) => v === n).map(([hex]) => hueOf(hex)).filter((h) => h !== null);
    if (hues.length > 1 && circularSpread(hues) > MAX_HUE_SPREAD) {
      problems.push(`nutrient ${n} mixes hues (${Math.round(circularSpread(hues))} degrees apart): not one colour family`);
    }
  }
  const scatter = fillScatter(rows);
  if (scatter > MAX_SCATTER) problems.push(`fills unevenly (scatter ${scatter.toFixed(2)}, max ${MAX_SCATTER}): nutrients sit at different heights`);

  const eps = 1e-9;
  if (getPuzzleProgress(puzzle, { 1: 1, 2: 1, 3: 1 }) < 1 - eps) problems.push('full nutrition does not complete the puzzle');
  if (getPuzzleProgress(puzzle, {}) !== 0) problems.push('empty progress is not 0');
  if (Math.abs(getPuzzleProgress(puzzle, { 1: 0.5, 2: 0.5, 3: 0.5 }) - 0.5) > 0.05) problems.push('half nutrition is not about half');
  if (!order || order.length !== nutrientOfColour.size) problems.push('colorOrder does not list every colour exactly once');
  getPuzzleProgressMessage(puzzle, { 1: 0.6, 2: 0.6, 3: 0.6 }, 'Tester');

  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${entry.slot}. ${puzzle.name.padEnd(16)} ${String(painted.length).padStart(3)} cells  carbs/protein/fats ${[1, 2, 3].map((n) => (per[n] / painted.length).toFixed(2)).join('/')}  ${nutrientOfColour.size} colours  scatter ${scatter.toFixed(2)}`);
  problems.forEach((p) => console.log(`       - ${p}`));
  if (problems.length) failed += 1;
}
process.exit(failed ? 1 : 0);
