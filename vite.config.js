import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  base: './',
  server: {
    port: 3000,
    strictPort: true,
    watch: {
      // Rust target மற்றும் src-tauri கோப்புகளை Vite கண்காணிக்கக் கூடாது
      ignored: ["**/src-tauri/**"]
    }
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
})