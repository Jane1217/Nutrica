/**
 * Helpers for validating what the vision model read from a nutrition label.
 */

// First emoji of a string, including skin-tone / ZWJ / variation-selector
// sequences. `\p{Emoji}` is intentionally not used: it also matches digits.
const EMOJI_PATTERN = /\p{Extended_Pictographic}(?:️|[\u{1F3FB}-\u{1F3FF}]|‍\p{Extended_Pictographic})*/u;

const extractFirstEmoji = (value) => {
  if (typeof value !== 'string') return null;
  const match = value.match(EMOJI_PATTERN);
  return match ? match[0] : null;
};

// Energy implied by the macros (Atwater factors).
const estimateCalories = ({ carbs = 0, fats = 0, protein = 0 }) => (
  4 * carbs + 9 * fats + 4 * protein
);

// How far the printed calories are from the macro-based estimate, as a ratio
// of the larger value. Printed labels round and exclude fibre, alcohol and
// sugar alcohols, so a modest gap is normal.
const calorieMismatch = (nutrition) => {
  const printed = Number(nutrition?.calories) || 0;
  const estimated = estimateCalories(nutrition || {});
  const larger = Math.max(printed, estimated);
  if (larger === 0) return 0;
  return Math.abs(printed - estimated) / larger;
};

// A read is suspicious (likely a misread digit or the wrong column) when the
// gap is both relatively large and larger than ordinary rounding slack.
const isLikelyMisread = (nutrition) => {
  const printed = Number(nutrition?.calories) || 0;
  const estimated = estimateCalories(nutrition || {});
  const gap = Math.abs(printed - estimated);
  return gap > Math.max(25, 0.35 * Math.max(printed, estimated));
};

module.exports = {
  extractFirstEmoji,
  estimateCalories,
  calorieMismatch,
  isLikelyMisread
};
