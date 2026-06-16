# Quickstart: Color-scheme and theme axis split

## Compose an identity with a color scheme

Set the two attributes independently (the bootstrap does this before paint; the toggles do it at runtime):

```html
<html data-color-scheme="dark" data-theme="vaporwave" data-density="compact">
```

That renders the vaporwave identity, in dark, at compact density. Switch `data-color-scheme` to `light` and the identity stays vaporwave.

## Wire the controls

```tsx
import { ColorSchemeToggle, DensityToggle, ThemeProvider, ThemeToggle } from '@unbranded-ds/react';

function Header() {
	return (
		<ThemeProvider>
			<ColorSchemeToggle />  {/* light / system / dark */}
			<ThemeToggle />        {/* default / brand / vaporwave (data-driven) */}
			<DensityToggle />
		</ThemeProvider>
	);
}
```

## Read state in a component

```tsx
const { resolved, colorScheme, set } = useTheme();
// resolved.theme === 'vaporwave', resolved.colorScheme === 'dark'
colorScheme.set('light');           // the convenience for the common case
set({ theme: 'brand', colorScheme: 'dark' }); // any subset of axes at once
```

## Validate the matrix

The build validates every shipped identity-by-scheme palette (six cells) for completeness and WCAG AA, including muted text on the base background. A failing cell fails the build:

```bash
pnpm --filter @unbranded-ds/tokens build   # emits + validates the palettes
pnpm --filter @unbranded-ds/tokens test    # the validator and store/resolver units
```

## See it composed

The spec-015 example app and the Storybook are updated in this change, so both demonstrate identity-by-scheme composition (and the example's pinned panel now reads `data-theme="vaporwave" data-color-scheme="dark"`). Run either to see vaporwave-light and vaporwave-dark side by side.
