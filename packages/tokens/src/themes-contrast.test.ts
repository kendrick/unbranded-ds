import type { ResolvedLayer } from './resolve.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { validateComposedTheme } from './validate.js';

// Validates every shipped identity-by-scheme cell of the matrix (spec 016) through
// the real validator: completeness AND WCAG AA on every declared contrast pair,
// including the new muted-foreground/background pair (the spec-015 gap). Each cell
// composes the same per-axis deltas the cascade applies — [colorScheme, theme] —
// so the test checks exactly what a page renders. A cell that drifts below AA on
// any pair fails the build here, not ships.
//
// Reads the build's emitted resolved-delta artifacts (spec 014), the single source
// of a bundled theme's values, rather than re-reading the raw DTCG source.

const here = dirname(fileURLToPath(import.meta.url));
const distThemesDir = join(here, '..', 'dist', 'json', 'themes');
function delta(name: string): ResolvedLayer {
	return JSON.parse(readFileSync(join(distThemesDir, `${name}.json`), 'utf8')) as ResolvedLayer;
}

// `light` and `default` are file-less, so their cells compose fewer (or zero)
// deltas — the canonical defaults base already carries them.
const CELLS: Array<{ name: string; layers: ResolvedLayer[] }> = [
	{ name: 'default-light', layers: [] },
	{ name: 'default-dark', layers: [delta('dark')] },
	{ name: 'brand-light', layers: [delta('brand-light')] },
	{ name: 'brand-dark', layers: [delta('dark'), delta('brand-dark')] },
	{ name: 'vaporwave-light', layers: [delta('vaporwave-light')] },
	{ name: 'vaporwave-dark', layers: [delta('dark'), delta('vaporwave-dark')] },
];

describe('matrix cells are complete and WCAG AA (spec 016 FR-004/FR-005)', () => {
	for (const { name, layers } of CELLS) {
		it(`${name} composes complete and passes AA on every contrast pair`, () => {
			const result = validateComposedTheme(layers, name, name);
			expect(result.ok, result.ok ? '' : JSON.stringify(result.issues, null, 2)).toBe(true);
		});
	}
});
