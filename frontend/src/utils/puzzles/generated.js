/**
 * Discover puzzles are stored compactly in the database (see
 * supabase/migrations/*_discover_puzzles.sql) and expanded here into the same shape as the
 * hand-drawn puzzles in data/puzzles/*.js, so the rest of the app does not need to know the
 * difference.
 *
 *   palette: [{ color: '#RRGGBB', nutrient: 1|2|3 }]   listed in the order a nutrient's colours fill
 *   grid:    24 rows x 24 palette indexes, -1 = empty background cell
 */
export const DISCOVER_COLLECTION_TYPE = 'Discover';
export const DISCOVER_CATEGORY_ID = 'discover';
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
