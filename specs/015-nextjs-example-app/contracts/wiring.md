# Contract: the wiring the example demonstrates

This is what a cloner reads and copies. Two surfaces carry it: `globals.css` (styling wiring) and `layout.tsx` (bootstrap and provider), plus the nested route for the pinned showcase.

## `app/globals.css`

```css
@import 'tailwindcss';
@import '@unbranded-ds/react/preset.css';

/* Themes this app uses. Additive: import only the ones you need. */
@import '@unbranded-ds/tokens/themes/dark.css';
@import '@unbranded-ds/tokens/themes/vaporwave.css';
@import '@unbranded-ds/tokens/themes/compact.css';

/* Consumer overrides. Delete this block to revert to design-system defaults. */
:root {
	--typography-font-sans: var(--font-local-sans), system-ui, sans-serif;
	/* a few --color-* overrides */
}
```

Contract:

- The first two lines are the canonical wiring (FR-003). Nothing else is required to get design-system styling, and the base look traces to them (SC-004).
- The theme imports are additive and labeled. `light` and `comfortable` are the defaults and need no import.
- The override block is clearly marked and removable (SC-005).

## `app/layout.tsx` (root layout)

Contract:

- Inlines `getThemeBootstrapScript()` from `@unbranded-ds/tokens/runtime` in `<head>` before any content, setting `data-theme` and `data-density` before paint (FR-004).
- Wraps the body in `<ThemeProvider>`, the single source of truth for the toggles.
- Renders `SkipLink` first, then the header (`ThemeToggle`, `DensityToggle`), then `{children}`.
- Declares the self-hosted face with `next/font/local` and exposes it as `--font-local-sans` for the override above.
- Is a server component; only the interactive leaves carry `'use client'`. No `window` or `document` access during render (Constitution IX.6).

## `app/showcase/page.tsx` (nested route)

Contract:

- Wraps its demo region in `<ThemeProvider forced={{ aesthetic: 'vaporwave', density: 'compact' }}>`.
- Labels the section as an alternative aesthetic composed with compact density, not a color-scheme, and links the color-scheme split note.
- Arriving here from the home page preserves the theme and density chosen elsewhere (FR-017).
