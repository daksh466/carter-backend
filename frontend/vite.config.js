import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devApiProxyTarget = process.env.VITE_DEV_API_PROXY_TARGET

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    proxy: devApiProxyTarget
      ? {
          '/api': {
            target: devApiProxyTarget,
            changeOrigin: true
          }
        }
      : undefined
  }
})
