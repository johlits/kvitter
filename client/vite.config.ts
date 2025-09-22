import { defineConfig } from 'vite';

// Proxy /api during local dev to the Node API on port 3000
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
      '/health': 'http://localhost:3000',
      '/version': 'http://localhost:3000'
    }
  }
});
