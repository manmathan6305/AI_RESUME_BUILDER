import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Polyfill Node.js globals used by @react-pdf/renderer's CJS deps
  // (base64-js, buffer, etc. reference `global` which doesn't exist in browsers)
  define: {
    global: 'globalThis',
  },

  optimizeDeps: {
    // lucide-react: skip pre-bundling for better tree-shaking
    exclude: ['lucide-react'],
    // Pre-bundle @react-pdf/renderer so esbuild converts its CJS deps
    // (base64-js, etc.) into a single ESM-compatible chunk.
    include: ['@react-pdf/renderer'],
  },
});

