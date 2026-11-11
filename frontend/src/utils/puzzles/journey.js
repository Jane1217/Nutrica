/**
 * Journey themes: the puzzles are the stages of one character (egg, chick, hen ...), and a stage can only be
 * chosen once every stage before it has been collected. The first stage is always open.
 */
export const isJourney = (category) => category?.type === 'journey';

/**
 * @param {Array<{name: string}>} puzzles   the theme's puzzles in stage order
 * @param {number} index                    which stage
 * @param {Record<string, boolean>} collected   puzzle name -> collected
 * @returns {{ locked: boolean, missing: string | null }}  missing = the first earlier stage still to collect
 */
export function getStageLock(puzzles, index, collected) {
  for (let i = 0; i < index; i += 1) {
    if (!collected?.[puzzles[i]?.name]) return { locked: true, missing: puzzles[i]?.name ?? null };
  }
  return { locked: false, missing: null };
}
