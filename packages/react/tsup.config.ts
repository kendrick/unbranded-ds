import { defineConfig } from "tsup";
import { copyFile } from "node:fs/promises";

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["esm"],
	dts: true,
	sourcemap: true,
	clean: true,
	external: ["react", "react-dom", "@base-ui-components/react"],
	onSuccess: async () => {
		await copyFile("src/preset.css", "dist/preset.css");
	},
});
