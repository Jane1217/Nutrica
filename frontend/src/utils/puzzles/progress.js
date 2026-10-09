/**
 * Pure helpers for turning nutrition progress into puzzle presentation data.
 * Keeping these separate from route components makes the completion rules
 * reusable and straightforward to test without a browser.
 */

export function getPuzzleNutrientColorsByOrder(pixelMap, nutrientType, colorOrder = []) {
  if (!Array.isArray(pixelMap)) return [];

  const colors = new Set();
  for (const row of pixelMap) {
    if (!Array.isArray(row)) continue;
    for (const pixel of row) {
      if (pixel?.nutrient === nutrientType) colors.add(pixel.color);
    }
  }

  return colorOrder.filter((color) => colors.has(color));
}

export function getPuzzleProgress(puzzle, nutritionProgress = {}) {
  if (!Array.isArray(puzzle?.pixelMap)) return 0;

  const nutrientPixelCounts = new Map();
  let total = 0;

  for (const row of puzzle.pixelMap) {
    if (!Array.isArray(row)) continue;
    for (const pixel of row) {
      if (!pixel || pixel.nutrient === 0) continue;
      total += 1;
      nutrientPixelCounts.set(
        pixel.nutrient,
        (nutrientPixelCounts.get(pixel.nutrient) || 0) + 1,
      );
    }
  }

  if (total === 0) return 0;

  let filled = 0;
  for (const [nutrient, count] of nutrientPixelCounts) {
    filled += Math.round(count * (nutritionProgress[nutrient] || 0));
  }

  return filled / total;
}

export function getPuzzleProgressMessage(puzzle, nutritionProgress, userName) {
  if (!puzzle) {
    return `Hey ${userName || 'there'}! Ready to collect today’s nutrition puzzle?`;
  }

  const descriptions = puzzle.descriptions;
  if (!Array.isArray(descriptions) || descriptions.length === 0) {
    return puzzle.description;
  }

  const progress = getPuzzleProgress(puzzle, nutritionProgress);
  const index = progress < 0.25
    ? 0
    : progress < 0.5
      ? 1
      : progress < 0.75
        ? 2
        : progress < 0.9
          ? 3
          : progress < 1
            ? 4
            : -1;

  return index === -1
    ? 'Puzzle collected! Treat yourself in tomorrow’s challenge!'
    : descriptions[index] || puzzle.description;
}

export function findPuzzleById(puzzleId, categories) {
  if (!puzzleId || !Array.isArray(categories)) return null;

  for (const category of categories) {
    const puzzle = category?.puzzles?.find((item) => item.id === puzzleId);
    if (puzzle) return puzzle;
  }

  return null;
}
