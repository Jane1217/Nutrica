const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();

// 安全中间件
app.use(helmet());

// CORS中间件
app.use(cors(config.cors));

// 请求体解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use(logger);

// 速率限制中间件
const limiter = rateLimit(config.api.rateLimit);
app.use(limiter);

// API路由
const routes = require('./routes');
app.use(config.api.prefix, routes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: '未找到请求的资源'
    }
  });
});

// 错误处理
app.use(errorHandler);

module.exports = app;