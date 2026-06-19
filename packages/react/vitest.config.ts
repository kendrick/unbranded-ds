import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					environment: 'jsdom',
					setupFiles: ['./vitest.setup.ts'],
					// The lint-rule test lives next to the rule it covers, outside src/.
					include: ['src/**/*.test.{ts,tsx}', 'eslint/**/*.test.{ts,tsx}'],
				},
			},
		],
	},
});
