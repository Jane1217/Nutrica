import { useEffect, useSyncExternalStore } from 'react';
import { puzzleCategories, colorOrders } from '../../data/puzzles';
import { collectionApi } from '../core/api';
import { DISCOVER_CATEGORY_ID, expandGeneratedPuzzle } from './generated';

/**
 * Registry for Discover puzzles. They arrive from the API after the app starts, so instead of
 * changing every place that reads `puzzleCategories` / `colorOrders`, the fetched puzzles are
 * added to those same exports (as an extra "Discover" category). Components that need to
 * re-render when they arrive call `useDiscoverPuzzles()`.
 */
let version = 0;
let loadPromise = null;
const listeners = new Set();

export const DISCOVER_CATEGORY_INFO = {
  id: DISCOVER_CATEGORY_ID,
  title: 'Discover',
  desc: 'More puzzles made from foods you love. Fill them with your daily nutrition, just like the garden ones.',
  type: 'collection',
  bgColor: '#D8E8E7',
};

export function registerDiscoverPuzzles(rows) {
  const expanded = (Array.isArray(rows) ? rows : []).map(expandGeneratedPuzzle).filter(Boolean);
  const index = puzzleCategories.findIndex((category) => category.id === DISCOVER_CATEGORY_ID);

  if (expanded.length === 0) {
    if (index >= 0) puzzleCategories.splice(index, 1);
  } else {
    const category = {
      ...DISCOVER_CATEGORY_INFO,
      count: expanded.length,
      puzzles: expanded.map((item) => item.puzzle),
    };
    if (index >= 0) puzzleCategories[index] = category;
    else puzzleCategories.push(category);
    expanded.forEach(({ puzzle, colorOrder }) => { colorOrders[puzzle.id] = colorOrder; });
  }

  version += 1;
  listeners.forEach((notify) => notify());
  return expanded.length;
}

export function findDiscoverPuzzleByName(name) {
  if (!name) return null;
  const category = puzzleCategories.find((item) => item.id === DISCOVER_CATEGORY_ID);
  return category?.puzzles.find((puzzle) => puzzle.name.toLowerCase() === String(name).toLowerCase()) || null;
}

// One request per page load (the API response is also cached). A failure is not remembered,
// so the next caller retries.
export function loadDiscoverPuzzles() {
  if (!loadPromise) {
    loadPromise = collectionApi.getDiscoverPuzzles()
      .then((response) => {
        if (!response?.success) throw new Error('Discover puzzles unavailable');
        registerDiscoverPuzzles(response.data);
        return response.data;
      })
      .catch((error) => {
        loadPromise = null;
        console.error('Could not load discover puzzles:', error);
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
export function useDiscoverPuzzles() {
  useEffect(() => { loadDiscoverPuzzles(); }, []);
  return useSyncExternalStore(subscribe, () => version, () => 0);
}

export function resetDiscoverPuzzlesForTests() {
  loadPromise = null;
  registerDiscoverPuzzles([]);
}
