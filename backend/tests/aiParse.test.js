process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.CORS_ORIGIN = 'https://nutrica.fit';

jest.mock('../src/middleware/auth', () => ({
  authenticateUser: (req, res, next) => {
    req.user = { id: '00000000-0000-4000-8000-000000000000' };
    next();
  }
}));

jest.mock('../src/services/openaiService', () => ({
  analyzeImage: jest.fn(),
  analyzeDescription: jest.fn(),
  getFoodEmoji: jest.fn()
}));

const request = require('supertest');
const openaiService = require('../src/services/openaiService');
const app = require('../src/server');

// Smallest buffer that passes the JPEG signature check
const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

const modelReply = (data) => ({
  choices: [{ message: { content: JSON.stringify(data) } }]
});

const scan = () => request(app)
  .post('/api/ai/parse/food')
  .attach('image', jpeg, { filename: 'label.jpg', contentType: 'image/jpeg' });

beforeEach(() => {
  jest.resetAllMocks();
  openaiService.getFoodEmoji.mockResolvedValue('🍽️');
});

describe('POST /api/ai/parse/food', () => {
  test('returns a consistent read from a single model call and reuses its emoji', async () => {
    openaiService.analyzeImage.mockResolvedValue(modelReply({
      name: 'Granola Bar', calories: 150, carbs: 27, fats: 3, protein: 5, emoji: '🍫'
    }));

    const response = await scan();

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual({
      name: 'Granola Bar',
      nutrition: { calories: 150, carbs: 27, fats: 3, protein: 5 },
      number_of_servings: 1,
      emoji: '🍫'
    });
    expect(openaiService.analyzeImage).toHaveBeenCalledTimes(1);
    expect(openaiService.getFoodEmoji).not.toHaveBeenCalled();
  });

  test('falls back to the emoji endpoint when the model omits a real emoji', async () => {
    openaiService.analyzeImage.mockResolvedValue(modelReply({
      name: 'Granola Bar', calories: 150, carbs: 27, fats: 3, protein: 5, emoji: '7'
    }));
    openaiService.getFoodEmoji.mockResolvedValue('🥜');

    const response = await scan();

    expect(response.body.data.emoji).toBe('🥜');
    expect(openaiService.getFoodEmoji).toHaveBeenCalledTimes(1);
  });

  test('re-reads once when calories do not match the macros and keeps the better read', async () => {
    openaiService.analyzeImage
      .mockResolvedValueOnce(modelReply({
        name: 'Soda', calories: 900, carbs: 10, fats: 2, protein: 3, emoji: '🥤'
      }))
      .mockResolvedValueOnce(modelReply({
        name: 'Soda', calories: 70, carbs: 10, fats: 2, protein: 3, emoji: '🥤'
      }));

    const response = await scan();

    expect(response.status).toBe(200);
    expect(response.body.data.nutrition.calories).toBe(70);
    expect(openaiService.analyzeImage).toHaveBeenCalledTimes(2);
    expect(openaiService.analyzeImage.mock.calls[1][2]).toEqual({
      previous: { calories: 900, carbs: 10, fats: 2, protein: 3 }
    });
  });

  test('keeps the first read when the re-read is not more consistent or fails', async () => {
    openaiService.analyzeImage
      .mockResolvedValueOnce(modelReply({
        name: 'Soda', calories: 900, carbs: 10, fats: 2, protein: 3, emoji: '🥤'
      }))
      .mockRejectedValueOnce(new Error('Image analysis failed'));

    const response = await scan();

    expect(response.status).toBe(200);
    expect(response.body.data.nutrition.calories).toBe(900);
  });

  test('returns 422 when the model cannot read a label', async () => {
    openaiService.analyzeImage.mockResolvedValue(modelReply({ error: true }));

    const response = await scan();

    expect(response.status).toBe(422);
    expect(openaiService.analyzeImage).toHaveBeenCalledTimes(1);
  });

  test('rejects files that are not real images before calling the model', async () => {
    const response = await request(app)
      .post('/api/ai/parse/food')
      .attach('image', Buffer.from('not an image'), { filename: 'x.jpg', contentType: 'image/jpeg' });

    expect(response.status).toBe(400);
    expect(openaiService.analyzeImage).not.toHaveBeenCalled();
  });
});

describe('POST /api/ai/parse/description', () => {
  test('uses the emoji returned with the nutrition estimate', async () => {
    openaiService.analyzeDescription.mockResolvedValue(modelReply({
      name: '2 eggs', calories: 140, carbs: 1, fats: 10, protein: 12, emoji: '🥚'
    }));

    const response = await request(app)
      .post('/api/ai/parse/description')
      .send({ description: '2 eggs' });

    expect(response.status).toBe(200);
    expect(response.body.data.emoji).toBe('🥚');
    expect(openaiService.getFoodEmoji).not.toHaveBeenCalled();
  });
});
