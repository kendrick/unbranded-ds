import { z } from 'zod';

// ---------------------------------------------------------------------------
// Token schema — mirrors the 6 token categories from the DTCG source files.
// Every theme must provide a value for every token defined here.
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
	'size-sm': z.string(),
	'size-base': z.string(),
	'size-lg': z.string(),
	'size-xl': z.string(),
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

// ---------------------------------------------------------------------------
// Theme schema — the user-facing format consumed by validateTheme / registerTheme.
// ---------------------------------------------------------------------------

export const themeSchema = z
	.object({
		name: z.string().min(1),
		displayName: z.string().min(1),
		tokens: z.object({
			color: colorTokens,
			spacing: spacingTokens,
			typography: typographyTokens,
			radius: radiiTokens,
			shadow: shadowTokens,
			opacity: opacityTokens,
		}),
	})
	.passthrough();

export type Theme = z.infer<typeof themeSchema>;

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
