import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { defineConfig } from 'vitest/config';

const dir = dirname(fileURLToPath(import.meta.url));

// Defines the `storybook` project the `test:storybook` script
// (`vitest run --project storybook`) has always referenced but nothing provided —
// which is why it errored with "No projects matched the filter" (spec 019).
// storybookTest() discovers stories from .storybook/main.ts, runs each story's
// `play` function (the interaction layer) and the addon-a11y axe pass (the
// accessibility layer). Browser mode is non-negotiable here: axe can only compute
// real color-contrast against a rendered surface, so jsdom would make the
// accessibility gate hollow.
export default defineConfig({
	test: {
		// Run story files one at a time. In browser mode, many files racing inside a
		// single headless Chromium drops the browser connection mid-run ("page closed
		// unexpectedly"). A CI gate needs determinism over speed, and the suite is small.
		fileParallelism: false,
		projects: [
			{
				plugins: [storybookTest({ configDir: join(dir, '.storybook') })],
				test: {
					name: 'storybook',
					// Retry interaction plays that lose the render race in CI's slower
					// headless Chromium: a play can run before a Base UI component's
					// deferred render commits, hitting an empty canvas so getByRole finds
					// nothing. The affected plays also switched to findBy* (which waits);
					// this nets any other interaction that races on a future run.
					retry: 2,
					setupFiles: [join(dir, '.storybook/vitest.setup.ts')],
					browser: {
						enabled: true,
						headless: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }],
					},
				},
			},
		],
	},
});
