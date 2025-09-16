import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all webhook calls to n8n in dev to avoid CORS
      '/webhook': {
        target: 'https://n8n.unitycompany.com.br',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
