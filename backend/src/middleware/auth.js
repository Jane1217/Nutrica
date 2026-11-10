const crypto = require('crypto');
const { supabase } = require('../services/databaseService');

const unauthorized = (res, message) => res.status(401).json({
  success: false,
  error: { message }
});

// Verifying a token costs a network round trip to Supabase Auth (~50-150ms),
// and one page load fires several API calls with the same token. Remember a
// verified token briefly (never past its own expiry) and share one in-flight
// verification between concurrent requests. A token revoked in the last
// TOKEN_CACHE_TTL_MS stays usable on this instance for that long at most.
const TOKEN_CACHE_TTL_MS = 60 * 1000;
const TOKEN_CACHE_MAX_ENTRIES = 500;
const verifiedTokens = new Map(); // token hash -> { user, expiresAt }
const pendingVerifications = new Map(); // token hash -> Promise<{ user, error }>

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Expiry from the (unverified) JWT payload; only used to *shorten* the cache lifetime.
const tokenExpiryMs = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const rememberToken = (key, token, user) => {
  if (verifiedTokens.size >= TOKEN_CACHE_MAX_ENTRIES) {
    verifiedTokens.delete(verifiedTokens.keys().next().value);
  }
  const now = Date.now();
  const exp = tokenExpiryMs(token);
  const expiresAt = Math.min(now + TOKEN_CACHE_TTL_MS, exp ?? Infinity);
  if (expiresAt > now) verifiedTokens.set(key, { user, expiresAt });
};

const verifyToken = (token) => {
  const key = hashToken(token);

  const cached = verifiedTokens.get(key);
  if (cached) {
    if (cached.expiresAt > Date.now()) return Promise.resolve({ user: cached.user, error: null });
    verifiedTokens.delete(key);
  }

  if (!pendingVerifications.has(key)) {
    const verification = supabase.auth.getUser(token)
      .then(({ data, error }) => {
        const user = data?.user ?? null;
        if (!error && user) rememberToken(key, token, user);
        return { user, error };
      })
      .finally(() => pendingVerifications.delete(key));
    pendingVerifications.set(key, verification);
  }
  return pendingVerifications.get(key);
};

// 用户认证中间件
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res, 'Access token required');
    }

    const token = authHeader.substring(7); // 移除 'Bearer ' 前缀

    // 验证JWT token
    const { user, error } = await verifyToken(token);

    if (error || !user) {
      return unauthorized(res, 'Invalid or expired token');
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    return unauthorized(res, 'Authentication failed');
  }
};

module.exports = {
  authenticateUser,
  // exposed for tests
  _clearTokenCache: () => {
    verifiedTokens.clear();
    pendingVerifications.clear();
  }
};
