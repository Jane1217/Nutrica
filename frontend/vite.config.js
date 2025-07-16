import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

const isLocal = !process.env.VERCEL;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0', // 允许局域网访问
    ...(isLocal && {
      https: {
        key: fs.readFileSync(path.resolve(process.env.HOME, 'certs/vite.key')),
        cert: fs.readFileSync(path.resolve(process.env.HOME, 'certs/vite.crt')),
      }
    }),
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 