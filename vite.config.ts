import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: true
  },
  server: {
    watch: {
      usePolling: true
    },
    port: 5173
  },
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components'
    }
  }
})
