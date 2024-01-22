/**
 * <reference types="vitest" />
 *  */
import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'
import wasm from 'vite-plugin-wasm'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Metaid',
      fileName: 'metaid',
    },
    minify: false,
  },
  plugins: [dts(), nodePolyfills(), wasm()],
})
