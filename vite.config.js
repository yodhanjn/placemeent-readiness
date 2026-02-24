import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] ?? ''
          if (url.startsWith('/@') || url.startsWith('/node_modules') || /\.[a-z0-9]+$/i.test(url)) {
            return next()
          }
          req.url = '/index.html'
          next()
        })
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] ?? ''
          if (url.startsWith('/@') || url.startsWith('/node_modules') || /\.[a-z0-9]+$/i.test(url) || url.startsWith('/assets/')) {
            return next()
          }
          req.url = '/index.html'
          next()
        })
      },
    },
  ],
})
