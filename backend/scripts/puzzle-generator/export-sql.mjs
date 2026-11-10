#!/usr/bin/env node
// Turns a reviewed theme into the SQL that publishes it: one puzzle_themes row, its generated_puzzles
// rows and the collection_puzzles rows (collection_type = the theme title) that let a finished puzzle be
// collected by the existing flow. Run it, read the SQL, then apply it as a migration.
//   node scripts/puzzle-generator/export-sql.mjs scripts/puzzle-generator/samples/breakfast_club
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const json = (v) => `${q(JSON.stringify(v))}::jsonb`;

const dir = path.resolve(process.cwd(), process.argv[2] || '');
const theme = JSON.parse(fs.readFileSync(path.join(dir, 'theme.json'), 'utf8'));

const out = [
  `insert into public.puzzle_themes (id, title, description, type, puzzle_count, bg_color, published) values `
  + `(${q(theme.id)}, ${q(theme.title)}, ${q(theme.description)}, ${q(theme.type)}, ${theme.count}, ${q(theme.bg_color)}, true);`,
];

for (const entry of theme.puzzles) {
  const mod = await import(pathToFileURL(path.join(dir, `${entry.id}.js`)).href);
  const puzzle = mod.default;
  const order = Object.values(mod).find(Array.isArray);

  // palette is listed in the order a nutrient's colours fill; grid holds palette indexes (-1 = empty)
  const palette = [];
  const indexOf = new Map();
  for (const colour of order) {
    const cell = puzzle.pixelMap.flat().find((c) => c.color === colour && c.nutrient);
    indexOf.set(colour, palette.length);
    palette.push({ color: colour, nutrient: cell.nutrient });
  }
  const grid = puzzle.pixelMap.map((row) => row.map((c) => (c.nutrient ? indexOf.get(c.color) : -1)));

  out.push(
    `insert into public.generated_puzzles (id, theme_id, slot, name, description, descriptions, bg_color, palette, grid) values `
    + `(${q(entry.id)}, ${q(theme.id)}, ${entry.slot}, ${q(puzzle.name)}, ${q(puzzle.description)}, ${json(puzzle.descriptions)}, ${q(puzzle.bgColor)}, ${json(palette)}, ${json(grid)});`,
    `insert into public.collection_puzzles (collection_type, puzzle_name, slot) values (${q(theme.title)}, ${q(puzzle.name)}, ${entry.slot});`,
  );
}
console.log(out.join('\n'));
