import { defineConfig, devices } from '@playwright/test';

// Runs against the PRODUCTION build (`next build` then `next start`): the
// no-flash behavior is only meaningful at production hydration timing (FR-016).
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: './tests',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL,
		trace: 'on-first-retry',
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
	],
	webServer: {
		command: `pnpm build && pnpm start --port ${PORT}`,
		url: baseURL,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
	},
});
