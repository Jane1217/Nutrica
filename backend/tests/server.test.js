process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.CORS_ORIGIN = 'https://nutrica.fit';

const request = require('supertest');
const app = require('../src/server');
const {
  cleanNutritionData,
  validateRequiredFields,
  validateCollectionPayload,
  validateFoodPayload
} = require('../src/utils/validation');

describe('public API safeguards', () => {
  test('health endpoint is publicly available with the expected CORS origin', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'https://nutrica.fit');

    expect(response.status).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('https://nutrica.fit');
    expect(response.body).toEqual({
      success: true,
      status: 'ok',
      service: 'nutrica-api'
    });
  });

  test.each([
    ['/api/ai/parse/description', { description: 'oatmeal with berries' }],
    ['/api/ai/parse/emoji', { text: 'oatmeal' }],
    ['/api/food', { name: 'oatmeal', nutrition: { calories: 300 } }]
  ])('rejects unauthenticated POST %s', async (path, body) => {
    const response = await request(app).post(path).send(body);

    expect(response.status).toBe(401);
  });
});

describe('generated themes endpoint', () => {
  const databaseService = require('../src/services/databaseService');

  afterEach(() => jest.restoreAllMocks());

  test('is public, cacheable and returns the published themes', async () => {
    jest.spyOn(databaseService, 'getGeneratedThemes').mockResolvedValue([{ id: 'breakfast_club', title: 'Breakfast Club', puzzles: [] }]);

    const response = await request(app).get('/api/collection/generated-themes');

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toContain('public');
    expect(response.body).toEqual({ success: true, data: [{ id: 'breakfast_club', title: 'Breakfast Club', puzzles: [] }] });
  });

  test('hides database errors', async () => {
    jest.spyOn(databaseService, 'getGeneratedThemes').mockRejectedValue(new Error('relation exploded'));
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await request(app).get('/api/collection/generated-themes');

    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain('exploded');
  });
});

describe('generated themes service', () => {
  const databaseService = require('../src/services/databaseService');
  const realSupabase = databaseService.supabase;

  // minimal stand-in for the supabase query builder: every call returns the builder, awaiting it resolves
  const fakeSupabase = (tables) => ({
    from: (name) => {
      const result = tables[name];
      const builder = {};
      ['select', 'eq', 'in', 'order'].forEach((method) => { builder[method] = () => builder; });
      builder.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
      return builder;
    },
  });

  afterEach(() => {
    databaseService.supabase = realSupabase;
    databaseService.clearCache?.('generated_themes');
  });

  const puzzle = (themeId, slot) => ({ id: `${themeId}_${slot}`, theme_id: themeId, slot, name: `P${themeId}${slot}` });

  test('only returns themes that have all their puzzles', async () => {
    databaseService.cache?.clear?.();
    databaseService.supabase = fakeSupabase({
      puzzle_themes: { data: [
        { id: 'full', title: 'Full', puzzle_count: 2 },
        { id: 'half', title: 'Half', puzzle_count: 3 },
      ], error: null },
      generated_puzzles: { data: [puzzle('full', 1), puzzle('full', 2), puzzle('half', 1)], error: null },
    });

    const themes = await databaseService.getGeneratedThemes();

    expect(themes.map((theme) => theme.id)).toEqual(['full']);
    expect(themes[0].puzzles.map((p) => p.slot)).toEqual([1, 2]);
  });

  test('returns an empty list while the tables do not exist yet', async () => {
    databaseService.cache?.clear?.();
    databaseService.supabase = fakeSupabase({
      puzzle_themes: { data: null, error: { code: '42P01', message: 'relation does not exist' } },
    });

    expect(await databaseService.getGeneratedThemes()).toEqual([]);
  });
});

describe('nutrition validation', () => {
  test('treats zero as a present required numeric value', () => {
    expect(validateRequiredFields({ calories: 0 }, ['calories'])).toBe(true);
  });

  test('normalizes valid numbers and allows zero values', () => {
    expect(cleanNutritionData({
      calories: '123.456',
      carbs: 0,
      fats: '12.3',
      protein: null
    })).toEqual({
      calories: 123.46,
      carbs: 0,
      fats: 12.3,
      protein: 0
    });
  });

  test.each([
    [{ calories: -1 }],
    [{ calories: 'Infinity' }],
    [{ calories: 100001 }],
    [null]
  ])('rejects unsafe nutrition data: %p', (nutrition) => {
    expect(() => cleanNutritionData(nutrition)).toThrow();
  });
});

describe('food payload validation', () => {
  test('normalizes a complete food record before privileged persistence', () => {
    expect(validateFoodPayload({
      name: '  oatmeal  ',
      nutrition: { calories: '300', carbs: 52, fats: 5, protein: 8 },
      number_of_servings: '2',
      time: '2026-10-08T12:00:00.000Z',
      emoji: '🥣'
    })).toEqual({
      name: 'oatmeal',
      nutrition: { calories: 300, carbs: 52, fats: 5, protein: 8 },
      number_of_servings: 2,
      time: '2026-10-08T12:00:00.000Z',
      emoji: '🥣'
    });
  });

  test.each([
    { name: ' ', nutrition: {} },
    { name: 'oatmeal', nutrition: {}, number_of_servings: 0 },
    { name: 'oatmeal', nutrition: {}, number_of_servings: 1.5 },
    { name: 'oatmeal', nutrition: {}, time: 'not-a-date' }
  ])('rejects malformed privileged food payloads: %p', (payload) => {
    expect(() => validateFoodPayload(payload)).toThrow();
  });
});

describe('collection payload validation', () => {
  test('normalizes a collection payload before it reaches the service-role database client', () => {
    expect(validateCollectionPayload({
      collection_type: '  Magic Garden  ',
      puzzle_name: '  Avocado  ',
      nutrition: { calories: '', carbs: '10.5', fats: 2, protein: 1 },
      count: '1'
    })).toEqual({
      collection_type: 'Magic Garden',
      puzzle_name: 'Avocado',
      nutrition: { calories: 0, carbs: 10.5, fats: 2, protein: 1 },
      count: 1
    });
  });

  test.each([
    { collection_type: 'Magic Garden', puzzle_name: 'Avocado', count: 0 },
    { collection_type: 'Magic Garden', puzzle_name: 'Avocado', count: 1.5 },
    { collection_type: 'Magic Garden', puzzle_name: 'Avocado', count: 101 },
    { collection_type: ' ', puzzle_name: 'Avocado' },
    { collection_type: 'Magic Garden', puzzle_name: ' ' }
  ])('rejects malformed collection payloads: %p', (payload) => {
    expect(() => validateCollectionPayload(payload)).toThrow();
  });
});
