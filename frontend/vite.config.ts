import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/in-ottero': {
        target: 'https://auth.quickledger.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/in-ottero/, ''),
      }
    }
  }
})
