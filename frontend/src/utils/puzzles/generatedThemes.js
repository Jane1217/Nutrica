import { useEffect, useSyncExternalStore } from 'react';
import { puzzleCategories, colorOrders } from '../../data/puzzles';
import { collectionApi } from '../core/api';
import { expandGeneratedTheme } from './generated';

/**
 * Registry for generated themes. They arrive from the API after the app starts, so instead of
 * changing every place that reads `puzzleCategories` / `colorOrders`, the fetched themes are added to
 * those same exports as extra categories (flagged `isGenerated`). Components that need to re-render
 * when they arrive call `useGeneratedThemes()`.
 */
let version = 0;
let loadPromise = null;
const listeners = new Set();

export const getGeneratedThemes = () => puzzleCategories.filter((category) => category.isGenerated);

export function registerGeneratedThemes(rows) {
  const themes = (Array.isArray(rows) ? rows : []).map(expandGeneratedTheme).filter(Boolean);

  // replace whatever was registered before
  for (let i = puzzleCategories.length - 1; i >= 0; i -= 1) {
    if (puzzleCategories[i].isGenerated) {
      puzzleCategories[i].puzzles.forEach((puzzle) => { delete colorOrders[puzzle.id]; });
      puzzleCategories.splice(i, 1);
    }
  }
  themes.forEach(({ category, colorOrders: orders }) => {
    puzzleCategories.push(category);
    Object.assign(colorOrders, orders);
  });

  version += 1;
  listeners.forEach((notify) => notify());
  return themes.length;
}

export function findGeneratedTheme(title) {
  return getGeneratedThemes().find((theme) => theme.title === title) || null;
}

// { puzzle, theme } for a generated puzzle name (case-insensitive), or null
export function findGeneratedPuzzle(name) {
  if (!name) return null;
  const wanted = String(name).toLowerCase();
  for (const theme of getGeneratedThemes()) {
    const puzzle = theme.puzzles.find((item) => item.name.toLowerCase() === wanted);
    if (puzzle) return { puzzle, theme };
  }
  return null;
}

// One request per page load (the API response is also cached). A failure is not remembered,
// so the next caller retries.
export function loadGeneratedThemes() {
  if (!loadPromise) {
    loadPromise = collectionApi.getGeneratedThemes()
      .then((response) => {
        if (!response?.success) throw new Error('Generated themes unavailable');
        registerGeneratedThemes(response.data);
        return getGeneratedThemes();
      })
      .catch((error) => {
        loadPromise = null;
        console.error('Could not load generated themes:', error);
        return [];
      });
  }
  return loadPromise;
}

const subscribe = (notify) => {
  listeners.add(notify);
  return () => listeners.delete(notify);
};

// Returns a number that changes when the registry changes; use it as a memo/effect dependency.
export function useGeneratedThemes() {
  useEffect(() => { loadGeneratedThemes(); }, []);
  return useSyncExternalStore(subscribe, () => version, () => 0);
}
