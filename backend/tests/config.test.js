const requiredEnvironment = {
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  OPENAI_API_KEY: 'test-openai-key',
};

const originalCorsOrigin = process.env.CORS_ORIGIN;
const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  Object.assign(process.env, requiredEnvironment, { NODE_ENV: 'development' });
  delete process.env.CORS_ORIGIN;
  jest.resetModules();
});

afterAll(() => {
  if (originalCorsOrigin === undefined) delete process.env.CORS_ORIGIN;
  else process.env.CORS_ORIGIN = originalCorsOrigin;

  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
});

test('uses Vite-compatible CORS defaults during local development', () => {
  const config = require('../src/config/config');

  expect(config.cors.origin).toEqual(expect.arrayContaining([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]));
});

test('normalizes configured CORS origins without trailing slashes', () => {
  process.env.CORS_ORIGIN = 'https://nutrica.fit/, https://preview.example.com/';
  jest.resetModules();

  const config = require('../src/config/config');

  expect(config.cors.origin).toEqual([
    'https://nutrica.fit',
    'https://preview.example.com',
  ]);
});
