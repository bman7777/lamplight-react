import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/lamplight/' : '/',
  plugins: [react()],
  server: {
    proxy: {
      '/ll': {
        target: 'https://kingdomwith.in',
        changeOrigin: true,
        secure: true,
      },
    },
  },
}))
