import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Electron loads the built app via file://, so asset URLs must be relative.
  // Without this, Vite emits /assets/* which resolves to file:///assets/* and the renderer stays white.
  base: './',
})
