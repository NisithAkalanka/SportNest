// Frontend/vite.config.js (සම්පූර්ණ නිවැරදි කරන ලද කේතය)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // path alias එක එලෙසම තියෙනවා. කිසිම වෙනසක් අවශ්‍ය නෑ.
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