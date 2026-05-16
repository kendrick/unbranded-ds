# Quickstart: Consumer DX preset

This is what a consumer's experience looks like end-to-end after 002 ships. Treat it as a validation surface — if any of these examples fail to produce the documented outcome, an FR has been violated.

## Setup (every consumer)

```sh
pnpm add @unbranded-ds/react @unbranded-ds/tokens tailwindcss@^4
```

In `app/globals.css` (or your equivalent stylesheet):

```css
@import 'tailwindcss';
@import '@unbranded-ds/react/preset.css';
```

Two lines. Done. Any `@unbranded-ds/react` component now renders with its intended styling.

For tokens-only consumers (Vue, Svelte, vanilla HTML — no React components):

```css
@import 'tailwindcss';
@import '@unbranded-ds/tokens/preset.css';
```

## Render a component

```tsx
import { Button } from '@unbranded-ds/react';

export default function Page() {
	return <Button>Hello unbranded</Button>;
}
```

The button renders with the intended typography, color, padding, and radius. No additional configuration required. Tested against spec User Story 1, Acceptance Scenario 1.

## Override the palette

Add a `:root` block below the preset import:

```css
@import 'tailwindcss';
@import '@unbranded-ds/react/preset.css';

:root {
	--color-primary: oklch(0.5 0.2 240);
	--color-primary-foreground: oklch(0.99 0 0);
}
```

The Button now uses your color. The override wins by cascade order, not by selector specificity — there's no fight. Tested against spec User Story 1, Acceptance Scenario 2.

## Prevent flash-of-wrong-theme

In your root layout (Next.js example):

```tsx
import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime';

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

That's it. On every page load, the saved theme (from `localStorage.getItem('unbranded-ds-theme')`) applies before first paint. Users who previously saved a dark theme see dark immediately, with no flash. Tested against spec User Story 3, Acceptance Scenario 1.

### Non-default fallback theme

If your default is `'dark'` instead of `'light'` (museum kiosk, theater, video editor):

```tsx
import { getThemeBootstrapScript } from '@unbranded-ds/tokens/runtime';

const bootstrap = getThemeBootstrapScript({ defaultTheme: 'dark' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html>
			<head>
				<script dangerouslySetInnerHTML={{ __html: bootstrap }} />
			</head>
			<body>{children}</body>
		</html>
	);
}
```

The factory output is deterministic — the same `defaultTheme` argument produces the same script content every build, so consumers using SHA hash-based Content Security Policy can compute the hash once.

### Under strict Content Security Policy

Attach a nonce to the script element:

```tsx
import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime';
import { headers } from 'next/headers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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

The nonce goes on the `<script>` element, not in the script content. No special API from this design system is needed; consumers handle their own nonce plumbing. Tested against spec User Story 3, Acceptance Scenario 2.

## Visually-hidden accessible markup

```tsx
import { VisuallyHidden } from '@unbranded-ds/react';
import { EyeIcon } from 'lucide-react';

<button>
	<EyeIcon />
	<VisuallyHidden>Show settings</VisuallyHidden>
</button>;
```

A screen reader announces "Show settings" when the button is focused. The icon is the only visible content. Tested against spec User Story 4, Acceptance Scenario 1.

Polymorphic usage (block-level wrapper, for example):

```tsx
<VisuallyHidden as="div">
	<h2>Section heading visible only to screen readers</h2>
</VisuallyHidden>;
```

For static markup, Tailwind's built-in `.sr-only` class is also available and behaves identically:

```tsx
<span className="sr-only">Same effect, no component</span>;
```

## Migrating from 0.1.0

```diff
- @import 'tailwindcss';
- @import '@unbranded-ds/tokens/dist/tailwind/preset.css';
- @source "../node_modules/@unbranded-ds/react";
+ @import 'tailwindcss';
+ @import '@unbranded-ds/react/preset.css';
```

```diff
- @import '@unbranded-ds/tokens/dist/css/tokens-light.css';
+ @import '@unbranded-ds/tokens/themes/light.css';
```

```diff
- <script dangerouslySetInnerHTML={{
-   __html: "(function(){var t=localStorage.getItem('ds-theme')||'light';document.documentElement.setAttribute('data-theme',t)})()"
- }} />
+ import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime'
+ <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
```

The localStorage key changed from `ds-theme` to `unbranded-ds-theme` — users with the old key saved will see the default theme on their first 0.2.0 load. See [contracts/migration.md](./contracts/migration.md) for the complete consumer-side change list.
