# Contract: 0.1.0 → 0.2.0 migration

Required by spec FR-017. This is the exact import-line mapping consumers need to follow when upgrading from `@unbranded-ds/{tokens,react}@0.1.0` to 0.2.0.

The breaking change: the wildcard exports (`./dist/tailwind/*` and `./dist/css/*` on the tokens package) are removed. Consumers using the old paths will see import errors after upgrading.

This document is the source for the "Migrating from 0.1.0" sections in both package READMEs, the 0.2.0 CHANGELOG entries, and the GitHub release notes (spec FR-016 through FR-018).

## CSS imports

### Before (0.1.0)

```css
@import 'tailwindcss';
@import '@unbranded-ds/tokens/dist/tailwind/preset.css';
@source "../node_modules/@unbranded-ds/react";
```

### After (0.2.0)

```css
@import 'tailwindcss';
@import '@unbranded-ds/react/preset.css';
```

For a tokens-only consumer (Vue, Svelte, vanilla HTML, native — no React components):

```css
@import 'tailwindcss';
@import '@unbranded-ds/tokens/preset.css';
```

Two lines replace three. The `@source` directive is bundled into the React preset.css; consumers no longer write it themselves.

## Theme defaults

### Before (0.1.0)

```css
@import '@unbranded-ds/tokens/dist/css/tokens-light.css';
@import '@unbranded-ds/tokens/dist/css/tokens-dark.css';
@import '@unbranded-ds/tokens/dist/css/tokens-brand.css';
```

### After (0.2.0)

```css
@import '@unbranded-ds/tokens/themes/light.css';
@import '@unbranded-ds/tokens/themes/dark.css';
@import '@unbranded-ds/tokens/themes/brand.css';
```

The `./themes/*` entries in the package's `files` field continue to resolve, but the `./dist/css/*` wildcard alias is gone. Consumers using the old path receive an unresolvable import; consumers using the `./themes/<name>.css` path are unaffected.

## FOUC prevention script

### Before (0.1.0)

Copy-paste the inline script from THEMING.md:132–145 into your layout:

```html
<script>
  (function () {
    var theme = localStorage.getItem('ds-theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

### After (0.2.0)

```tsx
import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime'

// In your root layout
<script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
```

**localStorage key changed**: from `ds-theme` (THEMING.md's earlier draft snippet) to `unbranded-ds-theme` (the canonical key established in 002). Consumers who manually persisted to `ds-theme` will lose their saved preference on first load after upgrade — the saved preference falls back to the default theme. Document this in the CHANGELOG as a soft-data-loss note. No automatic migration is provided.

For consumers wanting a non-default fallback theme (dark by default, for example):

```tsx
import { getThemeBootstrapScript } from '@unbranded-ds/tokens/runtime'

const bootstrap = getThemeBootstrapScript({ defaultTheme: 'dark' })

<script dangerouslySetInnerHTML={{ __html: bootstrap }} />
```

## `.sr-only` markup

### Before (0.1.0)

```tsx
<span className="sr-only">Show settings</span>
```

This continues to work in 0.2.0. Tailwind v4 ships `.sr-only` as a built-in utility; the design system never owned this class.

### Newly available in 0.2.0

```tsx
import { VisuallyHidden } from '@unbranded-ds/react'

<VisuallyHidden>Show settings</VisuallyHidden>
```

A polymorphic React component covering the same accessibility need. Use the className form for static markup; reach for the component for prop-driven or polymorphic cases.

## Summary of consumer changes

| Concern | Action required |
|---|---|
| Tailwind+React wiring | Replace 3 CSS lines with 2 lines; new import path is `@unbranded-ds/react/preset.css` |
| Tokens-only Tailwind wiring | Replace `dist/tailwind/preset.css` path with `preset.css` clean alias |
| Theme defaults | Replace `dist/css/tokens-<name>.css` paths with `themes/<name>.css` paths |
| FOUC prevention | Replace copy-paste inline script with `themeBootstrapScript` import. Manually migrate any users with the old `ds-theme` localStorage key (or accept the soft data loss on first reload). |
| Visually-hidden markup | No change required. The `<VisuallyHidden>` component is an optional addition. |

For consumers who hit the breaking change without reading the migration guide, the build will fail with an unresolvable-module error pointing at the old path. The error message itself names the path, so consumers can grep the CHANGELOG or this migration doc by path string and find their answer.
