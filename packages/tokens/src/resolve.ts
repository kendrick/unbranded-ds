import type { PartialTheme, Theme } from './schema.js';
import { canonicalDefaultTokens } from './defaults.js';

// ---------------------------------------------------------------------------
// resolveTheme — the inheritance step (spec 008 US2).
//
// A consumer runtime theme may override any subset of categories, and any
// subset of keys within a category. Before validation, the override is merged
// onto the canonical defaults so completeness and WCAG AA contrast check the
// COMPLETE merged result, never the raw fragment. Without this merge, a theme
// overriding one side of a contrast pair (e.g. color.background but not
// color.foreground) would slip past the old skip-when-a-side-is-absent path.
//
// The merge is PER-KEY within a category, not category-replace: a partial
// `{ color: { background: X } }` yields all default colors with only
// `background` overridden, NOT a color category collapsed to a single key.
// Every category is uniformly two-level (`{ [key]: string }`) — motion keys are
// flat (`duration-fast`, `easing-standard`), so no nesting logic is needed.
// ---------------------------------------------------------------------------

type ResolvedTokens = Theme['tokens'];
type PartialTokens = NonNullable<PartialTheme['tokens']>;

type Category = Record<string, string | undefined>;

/**
 * Deep-merge a partial token override onto the canonical defaults. The override
 * wins per-key; omitted keys and omitted whole categories inherit the default.
 *
 * Returns a complete token set suitable for strict-schema validation. Pure: it
 * reads only `canonicalDefaultTokens` and the argument, touches no globals, and
 * is therefore SSR-safe.
 */
export function resolveTheme(
	partialTokens: PartialTokens | undefined,
): ResolvedTokens {
	const defaults = canonicalDefaultTokens as Record<string, Category>;
	const override = (partialTokens ?? {}) as Record<string, Category>;

	const merged: Record<string, Category> = {};

	// Seed from defaults so every default category is present even when the
	// override never mentions it.
	for (const [category, group] of Object.entries(defaults)) {
		merged[category] = { ...group };
	}

	// Layer the override per-key. A category absent from defaults (a theme could
	// supply `ring`/`z-index` without a default, though defaults carries them)
	// still merges cleanly.
	for (const [category, group] of Object.entries(override)) {
		if (!group)
			continue;
		const base = merged[category] ?? {};
		for (const [key, value] of Object.entries(group)) {
			// deepPartial leaves omitted keys as `undefined`; skip them so the
			// inherited default survives rather than being clobbered by undefined.
			if (value === undefined)
				continue;
			base[key] = value;
		}
		merged[category] = base;
	}

	return merged as unknown as ResolvedTokens;
}
