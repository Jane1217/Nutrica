import assert from 'node:assert/strict';
import test from 'node:test';

import { saveNutritionGoal } from './nutrition.js';

// Minimal fake of the supabase-js query builder used by saveNutritionGoal
const fakeSupabase = ({ existingRows = [], lookupError = null, writeError = null } = {}) => {
  const calls = [];
  const builder = (table) => ({
    select() {
      return { eq: () => ({ limit: async () => ({ data: existingRows, error: lookupError }) }) };
    },
    update(values) {
      return { eq: async (column, value) => { calls.push({ op: 'update', table, values, column, value }); return { error: writeError }; } };
    },
    insert: async (rows) => { calls.push({ op: 'insert', table, rows }); return { error: writeError }; }
  });
  return { calls, from: builder };
};

test('inserts a goal for a user without one and derives the macro targets', async () => {
  const supabase = fakeSupabase();
  const { error } = await saveNutritionGoal(supabase, 'user-1', 2000);

  assert.equal(error, null);
  assert.equal(supabase.calls.length, 1);
  assert.equal(supabase.calls[0].op, 'insert');
  assert.deepEqual(
    { ...supabase.calls[0].rows[0], created_at: undefined },
    { user_id: 'user-1', calories: 2000, carbs: 250, fats: 67, protein: 100, created_at: undefined }
  );
});

test('updates the existing goal instead of inserting a duplicate', async () => {
  const supabase = fakeSupabase({ existingRows: [{ user_id: 'user-1' }] });
  await saveNutritionGoal(supabase, 'user-1', 1800);

  assert.equal(supabase.calls[0].op, 'update');
  assert.equal(supabase.calls[0].column, 'user_id');
  assert.equal(supabase.calls[0].values.calories, 1800);
});

test('rejects invalid calorie goals without touching the database', async () => {
  for (const bad of [0, -5, NaN, 'abc', null]) {
    const supabase = fakeSupabase();
    const { error } = await saveNutritionGoal(supabase, 'user-1', bad);
    assert.ok(error, `expected an error for ${bad}`);
    assert.equal(supabase.calls.length, 0);
  }
});

test('reports database errors instead of swallowing them', async () => {
  const failing = fakeSupabase({ writeError: { message: 'permission denied' } });
  const { error } = await saveNutritionGoal(failing, 'user-1', 2000);
  assert.equal(error.message, 'permission denied');
});
