/// <reference types="vitest" />
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Metaid',
      fileName: 'metaid',
    },
  },
})
