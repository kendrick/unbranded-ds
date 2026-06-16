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

// The concrete color scheme (light/dark): the flash-free bootstrap key for that
// axis, always concrete, never `system` (spec 016 split color scheme out).
export const COLOR_SCHEME_STORAGE_KEY = 'unbranded-ds-color-scheme';
// Companion key: the stated color-scheme intent, including `system`. The key
// above always holds a concrete value so the bootstrap never sees `system`; this
// lets the hook re-enter system-following on mount (FR-006).
export const COLOR_SCHEME_PREFERENCE_STORAGE_KEY = 'unbranded-ds-color-scheme-preference';
// The aesthetic identity (default/brand/vaporwave); no longer holds light/dark (spec 016).
export const THEME_STORAGE_KEY = 'unbranded-ds-theme';
// Each axis rides its own storage key (spec 009) so selections persist
// independently; picking one must not clobber the others.
export const DENSITY_STORAGE_KEY = 'unbranded-ds-density';
