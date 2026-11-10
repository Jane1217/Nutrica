process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://example.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
process.env.OPENAI_API_KEY = 'test-openai-key';

const mockGetUser = jest.fn();
jest.mock('../src/services/databaseService', () => ({
  supabase: { auth: { getUser: (...args) => mockGetUser(...args) } }
}));

const { authenticateUser, _clearTokenCache } = require('../src/middleware/auth');

const jwt = (expSecondsFromNow) => {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${encode({ alg: 'none' })}.${encode({ exp: Math.floor(Date.now() / 1000) + expSecondsFromNow })}.sig`;
};

const run = async (token) => {
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  await authenticateUser(req, res, next);
  return { req, res, next };
};

beforeEach(() => {
  jest.clearAllMocks();
  _clearTokenCache();
});

test('verifies a token once and reuses the result for later requests', async () => {
  const user = { id: 'user-1' };
  mockGetUser.mockResolvedValue({ data: { user }, error: null });
  const token = jwt(3600);

  const first = await run(token);
  const second = await run(token);

  expect(first.req.user).toEqual(user);
  expect(second.req.user).toEqual(user);
  expect(first.next).toHaveBeenCalled();
  expect(mockGetUser).toHaveBeenCalledTimes(1);
});

test('shares one verification between concurrent requests', async () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  const token = jwt(3600);

  await Promise.all([run(token), run(token), run(token)]);

  expect(mockGetUser).toHaveBeenCalledTimes(1);
});

test('does not cache a token that is already expired', async () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
  const token = jwt(-10);

  await run(token);
  await run(token);

  expect(mockGetUser).toHaveBeenCalledTimes(2);
});

test('rejects and never caches invalid tokens', async () => {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'bad jwt' } });
  const token = jwt(3600);

  const first = await run(token);
  await run(token);

  expect(first.res.status).toHaveBeenCalledWith(401);
  expect(first.next).not.toHaveBeenCalled();
  expect(mockGetUser).toHaveBeenCalledTimes(2);
});

test('requires a bearer token', async () => {
  const req = { headers: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  await authenticateUser(req, res, jest.fn());
  expect(res.status).toHaveBeenCalledWith(401);
  expect(mockGetUser).not.toHaveBeenCalled();
});
