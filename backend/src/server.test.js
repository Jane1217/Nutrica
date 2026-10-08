process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.CORS_ORIGIN = 'https://nutrica.fit';

const request = require('supertest');
const app = require('./server');
const { cleanNutritionData } = require('./utils/validation');

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

describe('nutrition validation', () => {
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
