import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                  // listen on every address, so Docker can forward port 5173
    watch: { usePolling: true }, // Windows doesn't tell the container a file changed: ask every 100 ms
    proxy: {
      // /api/... goes to our Express server. Same origin for the browser: no CORS.
      '/api': process.env.API_TARGET || 'http://localhost:3001',
    },
  },
})
