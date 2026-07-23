import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages (repo site) serves from /<repo-name>/ — change this to match
  // your actual repository name. If you deploy to a *user* site
  // (davidfdesousa.github.io), set base: '/' instead.
  base: '/monta-pc/',
})
