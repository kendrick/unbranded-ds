// Browser-safe axis constants. These used to live in axes.ts alongside the
// Node-only filesystem theme lister (`node:fs`), which meant importing the
// constants dragged `node:fs` into the type graph of any browser consumer (the
// react hook and toggles). They live here with no Node imports; axes.ts
// re-exports them so existing Node callers are unaffected. (spec 011)

// spec 016 split the old conflated `aesthetic` axis into two: `colorScheme`
// (light/dark, on `data-color-scheme`) and `theme` (the aesthetic identity:
// default/brand/vaporwave, keeping `data-theme`). Order matters: AXES is the
// cascade/composition order (color scheme is the base, theme refines it, density
// refines last), matching `@layer ds-color-scheme, ds-theme, ds-density`.
export type Axis = 'colorScheme' | 'theme' | 'density';

export const AXES: readonly Axis[] = ['colorScheme', 'theme', 'density'];

/** The DOM attribute each axis is applied through. */
export const AXIS_ATTRIBUTE: Record<Axis, string> = {
	colorScheme: 'data-color-scheme',
	theme: 'data-theme',
	density: 'data-density',
};
