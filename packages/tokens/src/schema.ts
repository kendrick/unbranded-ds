import { z } from 'zod';

// ---------------------------------------------------------------------------
// Token schema. Mirrors the token categories from the DTCG source files.
// The strict `themeSchema` represents a COMPLETE theme: every required
// category/key must be present. Consumer runtime themes may be PARTIAL (see
// `partialThemeSchema` below); they get merged onto `canonicalDefaultTokens`
// before being validated against the strict schema.
// ---------------------------------------------------------------------------

const colorTokens = z.object({
	'background': z.string(),
	'foreground': z.string(),
	'primary': z.string(),
	'primary-foreground': z.string(),
	'muted': z.string(),
	'muted-foreground': z.string(),
	'border': z.string(),
	'ring': z.string(),
	'destructive': z.string(),
	'destructive-foreground': z.string(),
});

const spacingTokens = z.object({
	px: z.string(),
	1: z.string(),
	2: z.string(),
	3: z.string(),
	4: z.string(),
	5: z.string(),
	6: z.string(),
	7: z.string(),
	8: z.string(),
	9: z.string(),
	10: z.string(),
	11: z.string(),
	12: z.string(),
	13: z.string(),
	14: z.string(),
	15: z.string(),
	16: z.string(),
});

const typographyTokens = z.object({
	'font-sans': z.string(),
	'font-mono': z.string(),
	// font-serif + size-2xl/3xl are required: a consumer theme must carry them
	// (or inherit them from the canonical defaults). Added for for-coleman (spec 008).
	'font-serif': z.string(),
	'size-sm': z.string(),
	'size-base': z.string(),
	'size-lg': z.string(),
	'size-xl': z.string(),
	'size-2xl': z.string(),
	'size-3xl': z.string(),
	'weight-normal': z.string(),
	'weight-medium': z.string(),
	'weight-semibold': z.string(),
	'weight-bold': z.string(),
	'leading-normal': z.string(),
	'leading-tight': z.string(),
	'leading-relaxed': z.string(),
});

const radiiTokens = z.object({
	sm: z.string(),
	md: z.string(),
	lg: z.string(),
	full: z.string(),
});

const shadowTokens = z.object({
	sm: z.string(),
	md: z.string(),
	lg: z.string(),
});

const opacityTokens = z.object({
	disabled: z.string(),
	hover: z.string(),
});

// Motion keys are FLATTENED (duration-fast, easing-standard) rather than nested
// (duration.fast). The runtime theme document is uniformly two-level
// (`tokens.<category>.<key> = string`), which is what validate.ts/runtime.ts
// iterate and inject as `--<category>-<key>`. A nested motion object would make
// the value an object, breaking that loop and the `Record<string,
// Record<string,string>>` shape the runtime layer relies on. The DTCG source
// (motion.json) stays nested per Style Dictionary convention; the build emits
// the Tailwind-aligned `--duration-*` / `--ease-*` names. The contract
// (token-schema.md) leaves nested-vs-flat to the implementer. Required.
const motionTokens = z.object({
	'duration-fast': z.string(),
	'duration-base': z.string(),
	'duration-slow': z.string(),
	'easing-standard': z.string(),
	'easing-decelerate': z.string(),
	'easing-accelerate': z.string(),
});

// ring + z-index are the optional drift-killing categories (spec 008 US4): a
// theme that omits them inherits the canonical defaults, so they never break an
// existing color-only theme. Optional-ness is applied at the category level in
// the tokens object below, not here.
const ringTokens = z.object({
	width: z.string(),
});

const zIndexTokens = z.object({
	overlay: z.string(),
	popover: z.string(),
	tooltip: z.string(),
	// `max` is the always-on-top layer: a focused SkipLink must beat every overlay,
	// including a consumer's own. Consumed by SkipLink (spec 010).
	max: z.string(),
});

// The complete tokens shape: required categories required, ring/z-index optional.
// The `z-index` key carries a hyphen, so the lint rule quotes every sibling key
// for consistency; the emitted dot-paths stay `z-index.overlay` etc.
const tokensSchema = z.object({
	'color': colorTokens,
	'spacing': spacingTokens,
	'typography': typographyTokens,
	'radius': radiiTokens,
	'shadow': shadowTokens,
	'opacity': opacityTokens,
	'motion': motionTokens,
	'ring': ringTokens.optional(),
	'z-index': zIndexTokens.optional(),
});

// ---------------------------------------------------------------------------
// Theme schema: the user-facing format consumed by validateTheme / registerTheme.
// `themeSchema` is STRICT: it validates a COMPLETE theme (the merged result of a
// partial override layered onto canonicalDefaultTokens). The downstream validator
// parses raw consumer input with `partialThemeSchema`, merges onto defaults, then
// validates the merged result here.
// ---------------------------------------------------------------------------

export const themeSchema = z
	.object({
		name: z.string().min(1),
		displayName: z.string().min(1),
		tokens: tokensSchema,
	})
	.passthrough();

export type Theme = z.infer<typeof themeSchema>;

// ---------------------------------------------------------------------------
// Partial (lenient) theme schema, for the INITIAL parse of consumer input.
//
// A consumer runtime theme may override any subset of categories, and any subset
// of keys within a category (spec 008 US2: "themes can override any token
// category"). `deepPartial()` makes every category optional, and every key inside
// each category optional too, so a `color`-only or `color`+`radius` fragment
// parses cleanly. The validator then merges this fragment onto
// canonicalDefaultTokens and re-validates the COMPLETE result against the strict
// `themeSchema` above.
//
// `name`/`displayName` stay required: a runtime theme still needs an identity to
// key its injected `<style>` block on. Only the `tokens` payload is partial.
// ---------------------------------------------------------------------------

export const partialThemeSchema = z
	.object({
		name: z.string().min(1),
		displayName: z.string().min(1),
		tokens: tokensSchema.deepPartial(),
	})
	.passthrough();

export type PartialTheme = z.infer<typeof partialThemeSchema>;

// ---------------------------------------------------------------------------
// Contrast pairs — declared foreground/background pairs for WCAG AA checking.
// ---------------------------------------------------------------------------

export interface ContrastPair {
	foreground: string;
	background: string;
	threshold: number;
}

export const contrastPairs: ContrastPair[] = [
	{
		foreground: 'color.foreground',
		background: 'color.background',
		threshold: 4.5,
	},
	{
		foreground: 'color.primary-foreground',
		background: 'color.primary',
		threshold: 4.5,
	},
	{
		foreground: 'color.muted-foreground',
		background: 'color.muted',
		threshold: 4.5,
	},
	{
		foreground: 'color.destructive-foreground',
		background: 'color.destructive',
		threshold: 4.5,
	},
];
