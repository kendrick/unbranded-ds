import type { PartialTheme, Theme } from './schema.js';
import { canonicalDefaultTokens } from './defaults.js';

// ---------------------------------------------------------------------------
// resolveTheme / composeTokens — the ONE merge (spec 008 US2; spec 009 US1).
//
// A consumer runtime theme may override any subset of categories and keys.
// Before validation, the override merges onto the canonical defaults so
// completeness and WCAG AA contrast check the COMPLETE result, never the raw
// fragment. Spec 009 generalizes this to N ordered layers for theme composition
// (an aesthetic axis plus a density axis): composeTokens folds resolved override
// DELTAS onto the defaults base, later layers winning per key.
//
// The merge is PER-KEY within a category, not category-replace, and every
// category is uniformly two-level (`{ [key]: string }`). One `mergeLayer` backs
// both `resolveTheme` (one partial) and `composeTokens` (N layers) so no second
// merge can drift — the load-bearing invariant behind the resolution-parity
// oracle.
// ---------------------------------------------------------------------------

type ResolvedTokens = Theme['tokens'];
type PartialTokens = NonNullable<PartialTheme['tokens']>;
type Category = Record<string, string | undefined>;

// The typed resolution boundary. A `ResolvedLayer` is a flat token override
// produced by resolving a theme. `composeTokens` accepts ONLY these; the only
// producer is `getResolvedDelta`, which reads the build's emitted resolved-delta
// artifact (spec 014) — so no surface can feed an unresolved shape into
// composition; the compiler forbids it. The brand sits on the LAYER type alone,
// so it adds zero friction to the complete-token (`ResolvedTokens`) consumers.
declare const LAYER: unique symbol;
export type ResolvedLayer = PartialTokens & { readonly [LAYER]: true };

function seedFromDefaults(): Record<string, Category> {
	const seed: Record<string, Category> = {};
	for (const [category, group] of Object.entries(
		canonicalDefaultTokens as Record<string, Category>,
	)) {
		seed[category] = { ...group };
	}
	return seed;
}

/**
 * The single per-key merge. `override` wins per key; `undefined` keys are
 * skipped so the inherited value survives rather than being clobbered. Mutates
 * and returns `base` — callers always pass a fresh seed, so it stays pure w.r.t.
 * its inputs and SSR-safe.
 */
function mergeLayer(
	base: Record<string, Category>,
	override: Record<string, Category>,
): Record<string, Category> {
	for (const [category, group] of Object.entries(override)) {
		if (!group)
			continue;
		const cat = base[category] ?? {};
		for (const [key, value] of Object.entries(group)) {
			if (value === undefined)
				continue;
			cat[key] = value;
		}
		base[category] = cat;
	}
	return base;
}

/**
 * Deep-merge a partial token override onto the canonical defaults. The override
 * wins per-key; omitted keys and whole categories inherit the default. Returns a
 * complete token set suitable for strict-schema validation. Pure / SSR-safe.
 */
export function resolveTheme(
	partialTokens: PartialTokens | undefined,
): ResolvedTokens {
	const merged = mergeLayer(
		seedFromDefaults(),
		(partialTokens ?? {}) as Record<string, Category>,
	);
	return merged as unknown as ResolvedTokens;
}

/**
 * Fold ordered resolved layers onto the defaults base; later layers win per key.
 * Callers pass `[aestheticDelta, densityDelta]` so density wins collisions.
 *
 * Each layer is a DELTA (the keys that axis set), NOT a complete set: folding
 * complete sets would clobber, because a complete density set carries default
 * colors that would overwrite the aesthetic's. This matches the build's CSS
 * emission (aesthetic full base layer, density delta on top), so the resolver
 * and the cascade agree by construction.
 */
export function composeTokens(layers: ResolvedLayer[]): ResolvedTokens {
	const merged = layers.reduce<Record<string, Category>>(
		(acc, layer) => mergeLayer(acc, layer as unknown as Record<string, Category>),
		seedFromDefaults(),
	);
	return merged as unknown as ResolvedTokens;
}
