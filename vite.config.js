import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5123',
        changeOrigin: true,
      }
    }
  },
  css: {
    postcss: './postcss.config.cjs',
  },
  build: {
    chunkSizeWarningLimit: 1500, // Increased to 1500 kB
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Better code splitting
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('html2canvas')) {
              return 'html2canvas' // Lazy load this
            }
            return 'vendor'
          }
        }
      }
    }
  }
})