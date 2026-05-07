import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // optional, for local dev
    }
  },
  // Tell Vite not to crawl into the server folder
  optimizeDeps: {
    exclude: []
  },
  build: {
    rollupOptions: {
      external: []
    }
  },
  resolve: {
    // Prevent duplicate React from server/node_modules
    dedupe: ['react', 'react-dom']
  }
})