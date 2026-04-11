export type TokenCategory =
	| "color"
	| "spacing"
	| "typography"
	| "radii"
	| "shadows"
	| "opacity";

export type TokenDefinition = {
	name: string;
	category: TokenCategory;
	type: string;
	cssVariable: string;
};

/**
 * Typed map of all tokens in the schema.
 * Keys are dot-paths (e.g. "color.primary"), values describe the token.
 */
export const tokenMap: Record<string, TokenDefinition> = {
	// Color tokens
	"color.background": { name: "color.background", category: "color", type: "color", cssVariable: "--color-background" },
	"color.foreground": { name: "color.foreground", category: "color", type: "color", cssVariable: "--color-foreground" },
	"color.primary": { name: "color.primary", category: "color", type: "color", cssVariable: "--color-primary" },
	"color.primary-foreground": { name: "color.primary-foreground", category: "color", type: "color", cssVariable: "--color-primary-foreground" },
	"color.muted": { name: "color.muted", category: "color", type: "color", cssVariable: "--color-muted" },
	"color.muted-foreground": { name: "color.muted-foreground", category: "color", type: "color", cssVariable: "--color-muted-foreground" },
	"color.border": { name: "color.border", category: "color", type: "color", cssVariable: "--color-border" },
	"color.ring": { name: "color.ring", category: "color", type: "color", cssVariable: "--color-ring" },
	"color.destructive": { name: "color.destructive", category: "color", type: "color", cssVariable: "--color-destructive" },
	"color.destructive-foreground": { name: "color.destructive-foreground", category: "color", type: "color", cssVariable: "--color-destructive-foreground" },

	// Spacing tokens
	"spacing.px": { name: "spacing.px", category: "spacing", type: "dimension", cssVariable: "--spacing-px" },
	"spacing.1": { name: "spacing.1", category: "spacing", type: "dimension", cssVariable: "--spacing-1" },
	"spacing.2": { name: "spacing.2", category: "spacing", type: "dimension", cssVariable: "--spacing-2" },
	"spacing.3": { name: "spacing.3", category: "spacing", type: "dimension", cssVariable: "--spacing-3" },
	"spacing.4": { name: "spacing.4", category: "spacing", type: "dimension", cssVariable: "--spacing-4" },
	"spacing.5": { name: "spacing.5", category: "spacing", type: "dimension", cssVariable: "--spacing-5" },
	"spacing.6": { name: "spacing.6", category: "spacing", type: "dimension", cssVariable: "--spacing-6" },
	"spacing.7": { name: "spacing.7", category: "spacing", type: "dimension", cssVariable: "--spacing-7" },
	"spacing.8": { name: "spacing.8", category: "spacing", type: "dimension", cssVariable: "--spacing-8" },
	"spacing.9": { name: "spacing.9", category: "spacing", type: "dimension", cssVariable: "--spacing-9" },
	"spacing.10": { name: "spacing.10", category: "spacing", type: "dimension", cssVariable: "--spacing-10" },
	"spacing.11": { name: "spacing.11", category: "spacing", type: "dimension", cssVariable: "--spacing-11" },
	"spacing.12": { name: "spacing.12", category: "spacing", type: "dimension", cssVariable: "--spacing-12" },
	"spacing.13": { name: "spacing.13", category: "spacing", type: "dimension", cssVariable: "--spacing-13" },
	"spacing.14": { name: "spacing.14", category: "spacing", type: "dimension", cssVariable: "--spacing-14" },
	"spacing.15": { name: "spacing.15", category: "spacing", type: "dimension", cssVariable: "--spacing-15" },
	"spacing.16": { name: "spacing.16", category: "spacing", type: "dimension", cssVariable: "--spacing-16" },

	// Typography tokens
	"typography.font-sans": { name: "typography.font-sans", category: "typography", type: "fontFamily", cssVariable: "--typography-font-sans" },
	"typography.font-mono": { name: "typography.font-mono", category: "typography", type: "fontFamily", cssVariable: "--typography-font-mono" },
	"typography.size-sm": { name: "typography.size-sm", category: "typography", type: "dimension", cssVariable: "--typography-size-sm" },
	"typography.size-base": { name: "typography.size-base", category: "typography", type: "dimension", cssVariable: "--typography-size-base" },
	"typography.size-lg": { name: "typography.size-lg", category: "typography", type: "dimension", cssVariable: "--typography-size-lg" },
	"typography.size-xl": { name: "typography.size-xl", category: "typography", type: "dimension", cssVariable: "--typography-size-xl" },
	"typography.weight-normal": { name: "typography.weight-normal", category: "typography", type: "fontWeight", cssVariable: "--typography-weight-normal" },
	"typography.weight-medium": { name: "typography.weight-medium", category: "typography", type: "fontWeight", cssVariable: "--typography-weight-medium" },
	"typography.weight-semibold": { name: "typography.weight-semibold", category: "typography", type: "fontWeight", cssVariable: "--typography-weight-semibold" },
	"typography.weight-bold": { name: "typography.weight-bold", category: "typography", type: "fontWeight", cssVariable: "--typography-weight-bold" },
	"typography.leading-normal": { name: "typography.leading-normal", category: "typography", type: "number", cssVariable: "--typography-leading-normal" },
	"typography.leading-tight": { name: "typography.leading-tight", category: "typography", type: "number", cssVariable: "--typography-leading-tight" },
	"typography.leading-relaxed": { name: "typography.leading-relaxed", category: "typography", type: "number", cssVariable: "--typography-leading-relaxed" },

	// Radii tokens
	"radius.sm": { name: "radius.sm", category: "radii", type: "dimension", cssVariable: "--radius-sm" },
	"radius.md": { name: "radius.md", category: "radii", type: "dimension", cssVariable: "--radius-md" },
	"radius.lg": { name: "radius.lg", category: "radii", type: "dimension", cssVariable: "--radius-lg" },
	"radius.full": { name: "radius.full", category: "radii", type: "dimension", cssVariable: "--radius-full" },

	// Shadow tokens
	"shadow.sm": { name: "shadow.sm", category: "shadows", type: "shadow", cssVariable: "--shadow-sm" },
	"shadow.md": { name: "shadow.md", category: "shadows", type: "shadow", cssVariable: "--shadow-md" },
	"shadow.lg": { name: "shadow.lg", category: "shadows", type: "shadow", cssVariable: "--shadow-lg" },

	// Opacity tokens
	"opacity.disabled": { name: "opacity.disabled", category: "opacity", type: "number", cssVariable: "--opacity-disabled" },
	"opacity.hover": { name: "opacity.hover", category: "opacity", type: "number", cssVariable: "--opacity-hover" },
} as const;
