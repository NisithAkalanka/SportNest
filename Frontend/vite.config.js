// Frontend/vite.config.js (cleaned and conflict‑free)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ★★★★★ Proxy settings ★★★★★
  server: {
    proxy: {
      // Any request starting with /api → forward to backend
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
      },
    },
  },
});