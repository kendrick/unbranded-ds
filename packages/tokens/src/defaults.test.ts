import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { canonicalDefaultTokens } from './defaults';

// ---------------------------------------------------------------------------
// Drift guard for canonicalDefaultTokens.
//
// defaults.ts holds hand-resolved string literals (it can't import the JSON
// sources, which aren't shipped; see defaults.ts header). This test reads the
// actual DTCG sources and asserts the literals still match, so the defaults
// can't silently rot when a source value changes.
//
// Structural categories + color have committed source files today. The motion,
// ring, and z-index sources are authored by a parallel worker and may not exist
// yet; those checks pin against the contract literals now and tighten to read
// the source file the moment it lands (the existsSync branch).
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensDir = resolve(__dirname, 'tokens');
const themesDir = resolve(__dirname, '..', 'themes');

interface DtcgLeaf {
	$value?: string;
	$type?: string;
}
type DtcgNode = DtcgLeaf | { [key: string]: DtcgNode };

function readJson(path: string): Record<string, unknown> {
	return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
}

function isLeaf(node: DtcgNode): node is DtcgLeaf {
	return '$value' in node;
}

/** Collapse a DTCG node to { key: stringValue }, preserving one level of nesting. */
function flattenCategory(node: DtcgNode): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const [key, child] of Object.entries(node as Record<string, DtcgNode>)) {
		out[key] = isLeaf(child) ? child.$value : flattenCategory(child);
	}
	return out;
}

/** Read a DTCG source file and return its single top-level category, flattened. */
function flattenSource(path: string, category: string): Record<string, unknown> {
	const doc = readJson(path);
	return flattenCategory(doc[category] as DtcgNode);
}

/**
 * Collapse a nested DTCG motion source (`duration.fast`) to the flat runtime
 * keys (`duration-fast`) that schema.ts/defaults.ts use. The runtime theme
 * document is uniformly two-level; the DTCG source is nested.
 */
function flattenMotionSource(path: string): Record<string, string> {
	const motion = readJson(path).motion as Record<string, DtcgNode>;
	const out: Record<string, string> = {};
	for (const [group, leaves] of Object.entries(motion)) {
		for (const [key, leaf] of Object.entries(leaves as Record<string, DtcgLeaf>)) {
			out[`${group}-${key}`] = leaf.$value ?? '';
		}
	}
	return out;
}

describe('canonicalDefaultTokens drift guard', () => {
	it('matches src/tokens/spacing.json', () => {
		expect(canonicalDefaultTokens.spacing).toEqual(
			flattenSource(resolve(tokensDir, 'spacing.json'), 'spacing'),
		);
	});

	it('matches src/tokens/typography.json for every key the source declares', () => {
		// The source's existing keys must match exactly. The three new for-coleman
		// keys (font-serif, size-2xl, size-3xl) are added to the source by a
		// parallel task (T004); until that lands they live only in defaults.ts, so
		// this checks the intersection and pins the new keys separately below.
		const source = flattenSource(
			resolve(tokensDir, 'typography.json'),
			'typography',
		);
		const defaults = canonicalDefaultTokens.typography as Record<string, string>;
		for (const [key, value] of Object.entries(source)) {
			expect(defaults[key]).toEqual(value);
		}
	});

	it('pins the new typography keys to the contract values', () => {
		const defaults = canonicalDefaultTokens.typography as Record<string, string>;
		expect(defaults['font-serif']).toBe(
			'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
		);
		expect(defaults['size-2xl']).toBe('1.5rem');
		expect(defaults['size-3xl']).toBe('1.875rem');
	});

	it('matches src/tokens/radii.json', () => {
		expect(canonicalDefaultTokens.radius).toEqual(
			flattenSource(resolve(tokensDir, 'radii.json'), 'radius'),
		);
	});

	it('matches src/tokens/shadows.json', () => {
		expect(canonicalDefaultTokens.shadow).toEqual(
			flattenSource(resolve(tokensDir, 'shadows.json'), 'shadow'),
		);
	});

	it('matches src/tokens/opacity.json', () => {
		expect(canonicalDefaultTokens.opacity).toEqual(
			flattenSource(resolve(tokensDir, 'opacity.json'), 'opacity'),
		);
	});

	it('sources color defaults from themes/aesthetic/light.json (the default theme)', () => {
		expect(canonicalDefaultTokens.color).toEqual(
			flattenSource(resolve(themesDir, 'aesthetic', 'light.json'), 'color'),
		);
	});

	// The next three pin against contract values and upgrade to a source-file
	// check the moment the parallel worker commits the source.
	it('motion matches src/tokens/motion.json (flattened) when present, else the contract values', () => {
		const sourcePath = resolve(tokensDir, 'motion.json');
		if (existsSync(sourcePath)) {
			expect(canonicalDefaultTokens.motion).toEqual(
				flattenMotionSource(sourcePath),
			);
		}
		else {
			expect(canonicalDefaultTokens.motion).toEqual({
				'duration-fast': '120ms',
				'duration-base': '240ms',
				'duration-slow': '480ms',
				'easing-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'easing-decelerate': 'cubic-bezier(0, 0, 0.2, 1)',
				'easing-accelerate': 'cubic-bezier(0.4, 0, 1, 1)',
			});
		}
	});

	it('ring matches src/tokens/ring.json when present, else the contract value', () => {
		const sourcePath = resolve(tokensDir, 'ring.json');
		if (existsSync(sourcePath)) {
			expect(canonicalDefaultTokens.ring).toEqual(
				flattenSource(sourcePath, 'ring'),
			);
		}
		else {
			expect(canonicalDefaultTokens.ring).toEqual({ width: '3px' });
		}
	});

	it('z-index matches src/tokens/z-index.json when present, else the contract values, ordered tooltip > popover > overlay', () => {
		const sourcePath = resolve(tokensDir, 'z-index.json');
		const zIndex = canonicalDefaultTokens['z-index'];
		expect(zIndex).toBeDefined();
		if (existsSync(sourcePath)) {
			expect(zIndex).toEqual(flattenSource(sourcePath, 'z-index'));
		}
		else {
			expect(zIndex).toEqual({ overlay: '50', popover: '55', tooltip: '60' });
		}
		// Ordering invariant from the contract, independent of the source.
		expect(Number(zIndex!.tooltip)).toBeGreaterThan(Number(zIndex!.popover));
		expect(Number(zIndex!.popover)).toBeGreaterThan(Number(zIndex!.overlay));
	});
});
