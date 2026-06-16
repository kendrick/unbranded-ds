---
"@unbranded-ds/tokens": minor
"@unbranded-ds/react": minor
---

Split the conflated theme axis into two composable axes: a color scheme (light/dark, on `data-color-scheme`, plus a `system` intent that follows the OS) and an aesthetic identity (default/brand/vaporwave, keeping `data-theme`, renamed internally from `aesthetic` to `theme`). They join the existing density axis.

Tokens: each identity now ships a complete authored palette per color scheme — six cells, every one validated WCAG AA, including the muted-foreground/background pair that slipped through in spec 015. The build emits per-combination CSS under compound `[data-theme][data-color-scheme]` selectors in the cascade order `@layer ds-color-scheme, ds-theme, ds-density;`, with new per-axis storage keys and a three-attribute flash-free bootstrap.

React: `useTheme()` gains a top-level `colorScheme` convenience (the resolved value plus a one-arg setter) for the common light/dark case; the axis maps stay the source of truth. The old `ThemeToggle` is renamed `ColorSchemeToggle` (light/system/dark), and a new data-driven `ThemeToggle` drives the identity axis.

No migration path ships: there are no external consumers yet, so this is a clean break rather than a deprecation window.
