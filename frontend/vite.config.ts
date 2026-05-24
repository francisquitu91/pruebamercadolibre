import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  preview: {
    allowedHosts: ['pruebamercadolibre.onrender.com', 'localhost'],
    host: '0.0.0.0',
    port: 3000,
  },
})
