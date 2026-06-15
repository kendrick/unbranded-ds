// Browser-safe client entry (spec 011). The constants, storage keys, and theme
// registry the react hook and toggles need, with no transitive `node:fs`.
//
// The barrel index re-exports token-map.ts (Node-only) and the `/runtime` entry
// re-exports `registerTheme`, which pulls in `validate.ts` -> `axisOf` ->
// axes.ts (`node:fs`). Neither is safe to drag into a browser consumer's type
// graph, so this entry exposes only the pure pieces. `runtime.ts` imports the
// storage keys from here, so there is a single source of truth.

export type { Axis } from './axis-constants.js';
export { AXES, AXIS_ATTRIBUTE } from './axis-constants.js';
export { themesForAxis } from './registry.js';

export const THEME_STORAGE_KEY = 'unbranded-ds-theme';
// Density rides its own storage key (spec 009) so an aesthetic and a density
// selection persist independently; picking one must not clobber the other.
export const DENSITY_STORAGE_KEY = 'unbranded-ds-density';
// Companion key (spec 011): the stated color-scheme intent, including `system`.
// The bootstrap key above always holds a concrete light/dark value so the
// flash-free bootstrap never sees `system`; this key lets the hook re-enter
// system-following on mount (FR-006).
export const THEME_PREFERENCE_STORAGE_KEY = 'unbranded-ds-theme-preference';
