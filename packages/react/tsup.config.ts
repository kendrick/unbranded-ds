import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	dts: true,
	sourcemap: true,
	clean: true,
	external: ['react', 'react-dom', '@base-ui-components/react'],
	onSuccess: async () => {
		await copyFile('src/preset.css', 'dist/preset.css');
	},
});
