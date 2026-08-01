import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Polyfill `global` for @react-pdf/renderer's CJS dependencies
  // (base64-js, buffer etc. reference `global` which doesn't exist in browsers)
  define: {
    global: 'globalThis',
  },

  optimizeDeps: {
    // lucide-react: skip pre-bundling for better tree-shaking
    exclude: ['lucide-react'],
    // Force esbuild to pre-bundle @react-pdf/renderer and convert its
    // CommonJS internals (base64-js, etc.) into a single ESM-compatible chunk.
    include: ['@react-pdf/renderer'],
  },

  build: {
    // Raise the chunk-size warning threshold — @react-pdf/renderer is large
    // but this is expected for a PDF engine
    chunkSizeWarningLimit: 2000,
  },
});
