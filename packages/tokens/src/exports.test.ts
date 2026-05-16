import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJsonPath = resolve(__dirname, "..", "package.json");

interface PackageJson {
	exports: Record<string, unknown>;
}

async function readPackageJson(): Promise<PackageJson> {
	const raw = await readFile(packageJsonPath, "utf8");
	return JSON.parse(raw) as PackageJson;
}

describe("@unbranded-ds/tokens package.json exports", () => {
	it("exposes ./preset.css as a clean alias to the Tailwind preset", async () => {
		const pkg = await readPackageJson();
		expect(pkg.exports["./preset.css"]).toBe("./dist/tailwind/preset.css");
	});

	it("removes the legacy ./dist/css/* wildcard export", async () => {
		const pkg = await readPackageJson();
		expect(pkg.exports["./dist/css/*"]).toBeUndefined();
	});

	it("removes the legacy ./dist/tailwind/* wildcard export", async () => {
		const pkg = await readPackageJson();
		expect(pkg.exports["./dist/tailwind/*"]).toBeUndefined();
	});

	it("leaves the root '.' export unchanged", async () => {
		const pkg = await readPackageJson();
		expect(pkg.exports["."]).toEqual({
			types: "./dist/ts/index.d.ts",
			import: "./dist/ts/index.js",
		});
	});

	it("leaves the ./runtime export unchanged", async () => {
		const pkg = await readPackageJson();
		expect(pkg.exports["./runtime"]).toEqual({
			types: "./dist/ts/runtime.d.ts",
			import: "./dist/ts/runtime.js",
		});
	});
});
