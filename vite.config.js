import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This ensures assets (like your game scripts) are linked correctly
  base: '/', 
  build: {
    outDir: 'dist',
  }
})
