import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// This base must match your repo name exactly
export default defineConfig({
  plugins: [react()],
  base: '/hedzup/', 
})
