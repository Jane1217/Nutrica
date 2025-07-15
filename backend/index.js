const app = require('./src/server');
const config = require('./src/config/config');

// For Vercel, we export the app directly
// For local development, we start the server
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${config.server.env}`);
    console.log(`API prefix: ${config.api.prefix}`);
  });
}

module.exports = app; 