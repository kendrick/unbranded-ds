import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const SRC = dirname(fileURLToPath(import.meta.url));

// The entries a browser bundles: the react package reaches `./client`, and a
// story reaches `./runtime` for `registerTheme`. Nothing in their transitive
// graph may import a Node builtin, or the bundle breaks — and the only thing
// that used to catch it was the slow Storybook Vite build, where rollup can't
// find `readdirSync` on its browser-external shim. This guards the invariant at
// unit speed. (The regression that prompted it: `/runtime` -> validate.ts ->
// axisOf -> axes.ts -> `node:fs`.)
const BROWSER_ENTRIES = ['client.ts', 'runtime.ts'];

// `import type`/`export type` are erased before any bundler sees them, so a
// type-only edge to a node module is harmless and must NOT be followed.
// eslint-disable-next-line regexp/no-super-linear-backtracking -- runs only over this repo's own source at test time (trusted input), never user input, so the backtracking this rule guards against is not a DoS vector here
const FROM_RE = /(?:import|export)\s+(?!type\b)[^'"]*?\sfrom\s*['"]([^'"]+)['"]/g;
const SIDE_EFFECT_RE = /import\s+['"]([^'"]+)['"]/g;

function stripComments(source: string): string {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

function specifiers(source: string): string[] {
	const clean = stripComments(source);
	const out: string[] = [];
	for (const m of clean.matchAll(FROM_RE)) {
		if (m[1])
			out.push(m[1]);
	}
	for (const m of clean.matchAll(SIDE_EFFECT_RE)) {
		if (m[1])
			out.push(m[1]);
	}
	return out;
}

// Source imports use `.js` specifiers for `.ts` files (repo convention).
function resolveSource(fromFile: string, spec: string): string | undefined {
	const base = resolve(dirname(fromFile), spec);
	for (const candidate of [base.replace(/\.js$/, '.ts'), base, `${base}.ts`]) {
		if (existsSync(candidate))
			return candidate;
	}
	return undefined;
}

function isNodeBuiltin(spec: string): boolean {
	return spec.startsWith('node:') || spec === 'fs' || spec === 'path';
}

function nodeBuiltinsInGraph(entry: string): string[] {
	const seen = new Set<string>();
	const hits: string[] = [];
	const stack = [resolve(SRC, entry)];
	while (stack.length > 0) {
		const file = stack.pop();
		if (!file || seen.has(file))
			continue;
		seen.add(file);
		for (const spec of specifiers(readFileSync(file, 'utf8'))) {
			if (isNodeBuiltin(spec)) {
				hits.push(`${file.slice(SRC.length + 1)} imports ${spec}`);
			}
			else if (spec.startsWith('.')) {
				const target = resolveSource(file, spec);
				if (target)
					stack.push(target);
			}
		}
	}
	return hits;
}

describe('browser-safe entries stay free of Node builtins', () => {
	for (const entry of BROWSER_ENTRIES) {
		it(`${entry} imports no node: builtin transitively`, () => {
			expect(nodeBuiltinsInGraph(entry)).toEqual([]);
		});
	}
});
