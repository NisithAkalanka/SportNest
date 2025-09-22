// Frontend/vite.config.js (සම්පූර්ණ නිවැරදි කරන ලද කේතය)

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
  // ★★★★★ අපි අලුතින් එකතු කරන Proxy Settings කොටස මෙන්න ★★★★★
  server: {
    proxy: {
      // '/api' වලින් පටන්ගන්න ඕනෑම request එකක්...
      '/api': {
        // ...මෙන්න මේ ලිපිනයට (ඔබේ Backend server එකට) යොමු කරන්න
        target: 'http://localhost:5002', 
        
        // CORS (Cross-Origin Resource Sharing) වැනි ගැටළු මගහරවා ගැනීමට
        changeOrigin: true, 
      },
    },
  },
});