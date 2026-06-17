import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	dts: true,
	sourcemap: true,
	clean: true,
	// Mark the whole bundle a client module so React Server Component consumers
	// (Next.js App Router) can import a component with no 'use client' boundary of
	// their own. A banner is the reliable way to land the directive as the literal
	// first line: esbuild does not carry a 'use client' written in source through
	// bundling into one file — it hoists or drops it.
	banner: { js: '\'use client\';' },
	external: ['react', 'react-dom', '@base-ui-components/react'],
	onSuccess: async () => {
		await copyFile('src/preset.css', 'dist/preset.css');
	},
});
