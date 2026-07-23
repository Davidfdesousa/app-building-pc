import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages (repo site) serves from /<repo-name>/ — must match the
  // actual repository name exactly, or built JS/CSS 404 and the page stays
  // blank. Current repo: davidfdesousa/app-building-pc.
  base: '/app-building-pc/',
})
