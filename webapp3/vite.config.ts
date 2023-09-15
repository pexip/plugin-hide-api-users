/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { defineConfig } from 'vite'
import mkcert from 'vite-plugin-mkcert'

import viteConfig from './vite.json'

export default defineConfig({
  base: './',
  build: {
    target: 'esnext'
  },
  server: {
    https: true,
    open: viteConfig.brandingPath + '/',
    port: 5173,
    proxy: {
      [viteConfig.brandingPath]: {
        target: viteConfig.infinityUrl,
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: viteConfig.infinityUrl,
        changeOrigin: true,
        secure: false
      }
    }
  },
  plugins: [
    mkcert()
  ]
})
