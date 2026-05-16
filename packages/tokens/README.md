# @unbranded-ds/tokens

Design tokens for the unbranded-ds design system. W3C DTCG-format JSON sources compiled via Style Dictionary into CSS variables, a Tailwind v4 `@theme` preset, JSON, and a typed TypeScript token map.

## Quickstart

In any Tailwind v4 project, add two lines to your global stylesheet:

```css
@import 'tailwindcss';
@import '@unbranded-ds/tokens/preset.css';
```

That registers the design-system Tailwind utilities backed by CSS variables (such as `bg-primary` and `rounded-md`). The `@theme inline` block in the preset is **registration-only** — it tells Tailwind the utility names exist, but does not set their values. Bring in default theme values by importing a theme file:

```css
@import '@unbranded-ds/tokens/themes/light.css';
@import '@unbranded-ds/tokens/themes/dark.css';
```

Or override token values directly in your own `:root`:

```css
:root {
	--color-primary: oklch(0.5 0.2 240);
}
```

Consumer overrides win by cascade order, not by selector specificity. No specificity battles.

## What's in the package

- Tailwind v4 preset (`./preset.css`) that registers token-backed utilities
- Built-in themes — light, dark, and brand (`./themes/<name>.css`)
- Runtime helpers (`./runtime`): `registerTheme`, `validateTheme`, `themeBootstrapScript`, `getThemeBootstrapScript`
- Typed TypeScript token map (default export)
- Raw JSON token output (`./dist/json/*` for cross-platform consumers)

## Preventing flash-of-wrong-theme

Theme-aware apps benefit from a tiny script in `<head>` that applies the saved theme before first paint. Import the canonical helper:

```tsx
import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime';

export default function RootLayout({ children }) {
	return (
		<html>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
			</head>
			<body>{children}</body>
		</html>
	);
}
```

It reads `localStorage.getItem('unbranded-ds-theme')` and applies `data-theme` to the document root before first paint, falling back to `'light'` when localStorage is empty or blocked.

### Non-default fallback theme

When your default is something other than light (museum kiosks, theater apps, video editors, sleep apps), reach for the factory:

```tsx
import { getThemeBootstrapScript } from '@unbranded-ds/tokens/runtime';

const bootstrap = getThemeBootstrapScript({ defaultTheme: 'dark' });

export function BootstrapScript() {
	return <script dangerouslySetInnerHTML={{ __html: bootstrap }} />;
}
```

The factory's output is deterministic across builds for any given `defaultTheme` argument — consumers using SHA hash-based Content Security Policies can compute the hash once and trust it.

### When to reach for which

- Use `themeBootstrapScript` (the constant) when your default theme is `light`. One import, one inline tag.
- Use `getThemeBootstrapScript({ defaultTheme })` (the factory) when your default is anything else.

Both share the same canonical `unbranded-ds-theme` localStorage key. Neither validates the saved theme value — if localStorage holds a value with no matching theme CSS, the page renders without those CSS variables until JS loads and a valid theme is registered. Validation belongs at runtime in `useTheme()` (coming in a future spec), not in the bootstrap script.

## Content Security Policy

Under a strict CSP that forbids `script-src 'unsafe-inline'`, attach a `nonce` to the `<script>` element to match your CSP nonce:

```tsx
import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime';
import { headers } from 'next/headers';

export default async function RootLayout({ children }) {
	const nonce = (await headers()).get('x-nonce') ?? undefined;
	return (
		<html>
			<head>
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
				/>
			</head>
			<body>{children}</body>
		</html>
	);
}
```

For hash-based CSP (SHA-256 allowlist), the factory's deterministic output means you compute the hash once at build time and add it to your CSP header. The bootstrap script body wraps itself in a `try`/`catch` for browsers where `localStorage` access throws (private browsing, sandboxed iframes).

A cookie-based server-rendered alternative — applying `data-theme` from a server-readable cookie so no inline script runs — is a roadmap item documented in [THEMING.md](../../THEMING.md). For now, the inline-script path covers all consumers.

## Migrating from 0.1.0

The `./dist/tailwind/*` and `./dist/css/*` wildcard exports are **removed** in 0.2.0. Two consumer-side concerns:

**Import paths.** Replace the old `dist/...` paths with the clean aliases:

```diff
- @import '@unbranded-ds/tokens/dist/tailwind/preset.css';
+ @import '@unbranded-ds/tokens/preset.css';
```

```diff
- @import '@unbranded-ds/tokens/dist/css/tokens-light.css';
+ @import '@unbranded-ds/tokens/themes/light.css';
```

**FOUC script.** If you previously copy-pasted the inline bootstrap script from THEMING.md, switch to the canonical export:

```diff
- <script dangerouslySetInnerHTML={{
-   __html: "(function(){var t=localStorage.getItem('ds-theme')||'light';document.documentElement.setAttribute('data-theme',t)})()"
- }} />
+ import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime'
+ <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
```

The localStorage key changes from `ds-theme` to `unbranded-ds-theme`. Users with the old key saved see the default theme on their first 0.2.0 load — their saved preference falls back to default.

## Theming

See [THEMING.md](../../THEMING.md) for the full theming contract — writing themes, validating them, applying them at runtime, preventing FOUC, and the design-space discussion of inline-script versus cookie-based-SSR approaches.

## License

MIT.
