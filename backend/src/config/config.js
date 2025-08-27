require('dotenv').config();

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development',
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' 
      ? ['https://nutrica.app', 'https://my-nutrition-demo-openai-frontend.vercel.app']
      : ['https://localhost:3000', 'http://localhost:3000']),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'X-CSRF-Token'
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 86400 // 24 hours
  },
  
  // Database configuration
  database: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // 性能优化配置
    connectionPool: {
      maxConnections: 20,
      idleTimeout: 30000, // 30秒
      connectionTimeout: 10000, // 10秒
    },
    // 查询优化
    query: {
      timeout: 15000, // 15秒查询超时
      retryAttempts: 3,
      retryDelay: 1000, // 1秒重试延迟
    }
  },
  
  // Cache configuration
  cache: {
    enabled: true,
    defaultTTL: 5 * 60 * 1000, // 5分钟
    maxSize: 1000, // 最大缓存条目数
    cleanupInterval: 10 * 60 * 1000, // 10分钟清理间隔
  },
  
  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },
  
  // File upload configuration
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  },

  // API configuration
  api: {
    prefix: '/api',
    version: 'v1',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // Limit each IP to 100 requests per 15 minutes
    },
    // 性能优化
    compression: true,
    timeout: 30000, // 30秒API超时
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

module.exports = config; 