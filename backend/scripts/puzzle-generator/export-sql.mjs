#!/usr/bin/env node
// Converts generated puzzle files into SQL INSERTs for public.generated_puzzles and the matching
// public.collection_puzzles rows (so a finished puzzle can be collected).
//   node scripts/puzzle-generator/export-sql.mjs ai_banana=samples/banana.js:Banana ...
//   (id=file:Display Name)
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const json = (v) => `${q(JSON.stringify(v))}::jsonb`;

const out = [];
let slot = 0;
for (const arg of process.argv.slice(2)) {
  const [id, rest] = arg.split('=');
  const [file, name] = rest.split(':');
  const mod = await import(pathToFileURL(path.resolve(process.cwd(), file)).href);
  const puzzle = mod.default;
  const order = Object.values(mod).find(Array.isArray);

  const palette = [];
  const indexOf = new Map();
  for (const colour of order) {
    const cell = puzzle.pixelMap.flat().find((c) => c.color === colour && c.nutrient);
    indexOf.set(colour, palette.length);
    palette.push({ color: colour, nutrient: cell.nutrient });
  }
  const grid = puzzle.pixelMap.map((row) => row.map((c) => (c.nutrient ? indexOf.get(c.color) : -1)));
  slot += 1;
  out.push(
    `insert into public.generated_puzzles (id, name, description, descriptions, bg_color, palette, grid, published) values `
    + `(${q(id)}, ${q(name)}, ${q(puzzle.description)}, ${json(puzzle.descriptions)}, ${q(puzzle.bgColor)}, ${json(palette)}, ${json(grid)}, true);`,
    `insert into public.collection_puzzles (collection_type, puzzle_name, slot) values ('Discover', ${q(name)}, ${slot});`,
  );
}
console.log(out.join('\n'));
