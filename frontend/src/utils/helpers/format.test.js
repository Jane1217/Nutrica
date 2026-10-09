import assert from 'node:assert/strict';
import test from 'node:test';
import { formatLocalDateKey } from './format.js';

test('creates stable local calendar-day keys without UTC date shifts', () => {
  assert.equal(formatLocalDateKey(new Date(2026, 0, 2)), '2026-01-02');
  assert.equal(formatLocalDateKey('2026-10-09'), '2026-10-09');
  assert.equal(formatLocalDateKey('not-a-date'), '');
});
