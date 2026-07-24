import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), ViteImageOptimizer({})],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true' ? { port: 24679 } : false,
      allowedHosts: true,
    },
    build: {
      target: 'es2022',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Isolate recharts (332KB) — only loaded when accessing dashboard routes
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-')) {
              return 'charts';
            }
            // Isolate framer-motion to reduce TBT
            if (id.includes('framer-motion') || id.includes('motion')) {
              return 'vendor-motion';
            }
            // Bundle all lucide icons into a single chunk to avoid request waterfalls
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Split React and React-DOM core
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            // Split React Router
            if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/@remix-run/')) {
              return 'vendor-router';
            }
          },
        },
      },
    },
  };
});