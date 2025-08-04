import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ["team-manager-production-a807.up.railway.app"]
  },
  server: {
    watch: {
      usePolling: true
    },
    port: 3000
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components'
    }
  }
})
