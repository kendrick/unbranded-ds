import { defineMain } from '@storybook/react-vite/node';
import tailwindcss from '@tailwindcss/vite';

export default defineMain({
	framework: '@storybook/react-vite',
	stories: [
		'../../../packages/react/src/**/*.mdx',
		'../../../packages/react/src/**/*.stories.@(js|jsx|ts|tsx)',
	],
	addons: [
		'@storybook/addon-vitest',
		'@storybook/addon-a11y',
		'@storybook/addon-mcp',
	],
	viteFinal(config) {
		config.plugins ??= [];
		config.plugins.push(tailwindcss());
		return config;
	},
});
