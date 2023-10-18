/// <reference types="vitest" />
import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
	test: {
		globals: true,
		testTimeout: 10000,
	},

	resolve: {
		alias: {
			"@": "/src",
		},
	},
	plugins: [
		dts({
			insertTypesEntry: true,
		}),
	],
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "Metaid",
			fileName: "metaid",
		},
		minify: false,
	},
});
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Metaid',
      fileName: 'metaid',
    },
    minify: false,
  },
})
