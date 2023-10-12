/// <reference types="vitest" />
import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
	test: {
		globals: true,
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
			// formats: ["es", "cjs", "umd", "iife"],
		},
	},
});
