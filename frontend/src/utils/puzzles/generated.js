/**
 * Generated themes (AI-made collections, like "Magic Garden") are stored compactly in the database
 * (see supabase/migrations/*_puzzle_themes.sql) and expanded here into the same shapes as the
 * hand-drawn categories and puzzles in data/puzzles/*.js, so the rest of the app does not need to
 * know the difference.
 *
 *   palette: [{ color: '#RRGGBB', nutrient: 1|2|3 }]   listed in the order a nutrient's colours fill
 *   grid:    24 rows x 24 palette indexes, -1 = empty background cell
 */
export const GRID_SIZE = 24;

const BACKGROUND = { color: '#F3F3EC', nutrient: 0 };
const HEX_COLOUR = /^#[0-9A-Fa-f]{6}$/;

export function isValidGeneratedPuzzle(row) {
  if (!row || typeof row.id !== 'string' || typeof row.name !== 'string') return false;
  if (!Array.isArray(row.descriptions) || row.descriptions.length !== 5) return false;
  if (!Array.isArray(row.palette) || row.palette.length === 0) return false;
  if (!row.palette.every((p) => HEX_COLOUR.test(p?.color) && [1, 2, 3].includes(p?.nutrient))) return false;
  if (!Array.isArray(row.grid) || row.grid.length !== GRID_SIZE) return false;
  return row.grid.every((line) => Array.isArray(line)
    && line.length === GRID_SIZE
    && line.every((i) => Number.isInteger(i) && i >= -1 && i < row.palette.length));
}

// A finished-artwork image (what the app shows when the puzzle is complete, and in lists).
export function buildPuzzleSvgUrl(palette, grid, cell = 10) {
  const size = GRID_SIZE * cell;
  const rects = [];
  grid.forEach((line, y) => line.forEach((index, x) => {
    if (index >= 0) {
      rects.push(`<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${palette[index].color}"/>`);
    }
  }));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function expandGeneratedPuzzle(row) {
  if (!isValidGeneratedPuzzle(row)) return null;

  const pixelMap = row.grid.map((line) => line.map((index) => (
    index < 0 ? BACKGROUND : { color: row.palette[index].color, nutrient: row.palette[index].nutrient }
  )));

  return {
    puzzle: {
      id: row.id,
      name: row.name,
      description: row.description,
      descriptions: row.descriptions,
      img: buildPuzzleSvgUrl(row.palette, row.grid),
      bgColor: row.bg_color || '#D8E8E7',
      pixelMap,
      isGenerated: true,
    },
    colorOrder: row.palette.map((p) => p.color),
  };
}

// A theme row from the API ({ id, title, description, type, puzzle_count, bg_color, puzzles: [...] })
// becomes a category like the ones in data/puzzles/index.js. A theme whose puzzles are not all valid and
// complete is ignored as a whole (a half theme would break "3/6" style progress).
export function expandGeneratedTheme(row) {
  if (!row || typeof row.id !== 'string' || typeof row.title !== 'string' || !Array.isArray(row.puzzles)) return null;
  if (row.type !== 'collection') return null;
  if (!Number.isInteger(row.puzzle_count) || row.puzzles.length !== row.puzzle_count) return null;

  const expanded = [...row.puzzles]
    .sort((a, b) => (a.slot || 0) - (b.slot || 0))
    .map(expandGeneratedPuzzle);
  if (expanded.some((item) => item === null)) return null;

  const bgColor = HEX_COLOUR.test(row.bg_color) ? row.bg_color : '#D8E8E7';
  const colorOrders = {};
  expanded.forEach(({ puzzle, colorOrder }) => { colorOrders[puzzle.id] = colorOrder; });

  return {
    category: {
      id: row.id,
      title: row.title,
      desc: row.description,
      count: row.puzzle_count,
      type: 'collection',
      bgColor,
      puzzles: expanded.map((item) => item.puzzle),
      isGenerated: true,
    },
    colorOrders,
  };
}
