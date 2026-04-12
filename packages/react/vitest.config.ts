import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					environment: "jsdom",
					setupFiles: ["./vitest.setup.ts"],
					include: ["src/**/*.test.{ts,tsx}"],
				},
			},
		],
	},
});
