import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { contrastRatio, parseColor } from './color.js';
import { contrastPairs } from './schema.js';

// Guards every built-in theme against its own declared WCAG AA contrast pairs.
// Spec 008 exposed that light's muted-foreground/muted (4.40) and
// destructive-foreground/destructive (3.61) sat just under 4.5 — invisible while
// the validator skipped pairs, but a real failure once a partial runtime theme
// inherits those defaults. This test fails loudly if any built-in theme drifts
// below threshold on any declared pair.

const here = dirname(fileURLToPath(import.meta.url));
// Read the build's emitted resolved-delta artifact (spec 014) — the single
// source of a bundled theme's values — instead of re-reading the raw DTCG source.
const distThemesDir = join(here, '..', 'dist', 'json', 'themes');
const load = (name: string): Record<string, Record<string, string>> =>
	JSON.parse(readFileSync(join(distThemesDir, `${name}.json`), 'utf8'));

const themes: Record<string, ReturnType<typeof load>> = {
	light: load('light'),
	dark: load('dark'),
	brand: load('brand'),
};

function resolve(theme: ReturnType<typeof load>, dotPath: string): string | undefined {
	const [category, key] = dotPath.split('.');
	return theme[category ?? '']?.[key ?? ''];
}

describe('built-in theme contrast (WCAG AA)', () => {
	for (const [name, theme] of Object.entries(themes)) {
		for (const pair of contrastPairs) {
			it(`${name}: ${pair.foreground} / ${pair.background} meets ${pair.threshold}:1`, () => {
				const fg = resolve(theme, pair.foreground);
				const bg = resolve(theme, pair.background);
				expect(fg, `${pair.foreground} present`).toBeDefined();
				expect(bg, `${pair.background} present`).toBeDefined();

				const f = parseColor(fg!);
				const b = parseColor(bg!);
				expect(f, `${pair.foreground} parseable`).not.toBeNull();
				expect(b, `${pair.background} parseable`).not.toBeNull();

				const ratio = contrastRatio(f!, b!);
				expect(ratio).toBeGreaterThanOrEqual(pair.threshold);
			});
		}
	}
});
