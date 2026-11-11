import test from 'node:test';
import assert from 'node:assert/strict';
import { getStageLock, isJourney } from './journey.js';

const stages = [{ name: 'Egg' }, { name: 'Cracked Egg' }, { name: 'Chick' }];

test('the first stage is always open', () => {
  assert.deepEqual(getStageLock(stages, 0, {}), { locked: false, missing: null });
});

test('a stage stays locked until every earlier stage is collected', () => {
  assert.deepEqual(getStageLock(stages, 1, {}), { locked: true, missing: 'Egg' });
  assert.deepEqual(getStageLock(stages, 2, { Egg: true }), { locked: true, missing: 'Cracked Egg' });
  assert.deepEqual(getStageLock(stages, 2, { 'Cracked Egg': true }), { locked: true, missing: 'Egg' });
});

test('collecting the stages in order opens the next one', () => {
  assert.deepEqual(getStageLock(stages, 1, { Egg: true }), { locked: false, missing: null });
  assert.deepEqual(getStageLock(stages, 2, { Egg: true, 'Cracked Egg': true }), { locked: false, missing: null });
});

test('only journey themes are journeys', () => {
  assert.equal(isJourney({ type: 'journey' }), true);
  assert.equal(isJourney({ type: 'collection' }), false);
  assert.equal(isJourney(null), false);
});
