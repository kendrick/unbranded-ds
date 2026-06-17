import { defineMain } from '@storybook/react-vite/node';
import tailwindcss from '@tailwindcss/vite';

export default defineMain({
	framework: '@storybook/react-vite',
	stories: [
		'../../../packages/react/src/**/*.mdx',
		'../../../packages/react/src/**/*.stories.@(js|jsx|ts|tsx)',
	],
	addons: [
		'@storybook/addon-docs',
		'@storybook/addon-vitest',
		'@storybook/addon-a11y',
		'@storybook/addon-mcp',
	],
	viteFinal(config) {
		config.plugins ??= [];
		config.plugins.push(tailwindcss());
		// Force a single React instance. In CI's fresh dep-optimization, react and
		// react-dom were duplicated into an optimized chunk, so a component hook ran
		// against a second React whose dispatcher was null. React reports this as
		// "Invalid hook call... more than one copy of React"; the render throws and
		// the test-runner sees an empty canvas (spec 019). dedupe pins one copy.
		config.resolve ??= {};
		config.resolve.dedupe = [...(config.resolve.dedupe ?? []), 'react', 'react-dom'];
		// Pre-bundle React in the first optimize pass so Vite does not re-optimize it
		// mid-run when it discovers the Base UI deps cold. That re-optimization is what
		// duplicated React in CI (always a cold cache) and left the canvas empty.
		config.optimizeDeps ??= {};
		config.optimizeDeps.include = [
			...(config.optimizeDeps.include ?? []),
			'react',
			'react-dom',
			'react-dom/client',
			'react/jsx-runtime',
			'react/jsx-dev-runtime',
		];
		return config;
	},
});
