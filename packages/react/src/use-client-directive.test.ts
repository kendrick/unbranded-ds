import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Spec 017: the published bundle must declare itself a client module so React
// Server Component consumers (Next.js App Router) can import a component without
// their own 'use client' boundary. That directive is a single line of tsup config
// (a banner) — trivially lost in a future build change, and a regression only
// surfaces in a consumer's app, never here. So guard it at this package's own
// build: the built entry's first line must be the directive.
//
// Reads the build artifact, so it depends on a prior `pnpm build` — the same
// build-first order the token-query MCP smoke test relies on (CI runs `build`
// before `test:unit`).

const here = dirname(fileURLToPath(import.meta.url));
const bundlePath = join(here, '..', 'dist', 'index.js');

describe("published bundle declares itself a client module (spec 017 FR-002/FR-004)", () => {
	it('begins with a use-client directive on the first line', () => {
		const firstLine = readFileSync(bundlePath, 'utf8').split('\n', 1)[0]!.trim();
		// Quote style and the trailing semicolon are incidental; what matters is
		// that an RSC bundler sees the directive first. Match the meaning, not the
		// exact bytes, so a stylistic tweak to the banner does not trip the guard.
		expect(firstLine).toMatch(/^(['"])use client\1;?$/);
	});
});
