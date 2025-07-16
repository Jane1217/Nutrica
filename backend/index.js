const app = require('./src/server');
const config = require('./src/config/config');

// 仅在本地开发时启动监听
if (!process.env.VERCEL) {
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${config.server.env}`);
    console.log(`🔗 API prefix: ${config.api.prefix}`);
  });
}

// 云端部署时只导出 app
module.exports = app;