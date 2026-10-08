import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

const isLocal = !process.env.VERCEL;

// 检查SSL证书文件是否存在
const getHttpsConfig = () => {
  try {
    const certPath = path.resolve(process.env.HOME || process.env.USERPROFILE || '', 'certs');
    const keyPath = path.join(certPath, 'vite.key');
    const certPath2 = path.join(certPath, 'vite.crt');
    
    if (fs.existsSync(keyPath) && fs.existsSync(certPath2)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath2),
      };
    }
  } catch (error) {
    console.log('SSL certificate files not found, will use HTTP mode');
  }
  return false;
};

const localHttpsConfig = isLocal ? getHttpsConfig() : false;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0', // 允许局域网访问
    ...(localHttpsConfig && {
      https: localHttpsConfig
    })
  },
  build: {
    outDir: 'dist',
    // Do not publish source maps by default. They significantly increase the
    // deployment size and expose the original client source to every visitor.
    sourcemap: process.env.SOURCE_MAPS === 'true'
  }
})
