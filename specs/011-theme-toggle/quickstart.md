# Quickstart: Theme controls

How a consumer wires up flash-free, multi-axis theming with the toggles.

## 1. Inline the bootstrap (no flash on reload)

This is the spec-002 script, unchanged. It sets `data-theme` and `data-density` before first paint.

```tsx
import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime';

// In your document <head>, before the app renders:
<script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />;
```

## 2. Wrap the app in the provider

```tsx
import { ThemeProvider } from '@unbranded-ds/react';

export function App({ children }) {
	return <ThemeProvider>{children}</ThemeProvider>;
}
```

## 3. Drop in the toggles

A color-scheme control next to a density control. Setting one of each is how `vaporwave compact` happens: two independent axes, no composite variant.

```tsx
import { ThemeToggle, DensityToggle } from '@unbranded-ds/react';

<ThemeToggle />     {/* light / system / dark */}
<DensityToggle />   {/* comfortable / compact */}
```

## 4. Pin an axis you do not want users to change

Lock density to `compact` and expose only the color scheme. The `<DensityToggle>` (if rendered) shows disabled, and `set({ density })` becomes a no-op.

```tsx
<ThemeProvider forced={{ density: 'compact' }}>
	<ThemeToggle />
</ThemeProvider>;
```

## 5. Read or set any axis directly

```tsx
import { useTheme } from '@unbranded-ds/react';

function Example() {
	const { resolved, set } = useTheme();
	return (
		<button onClick={() => set({ aesthetic: 'vaporwave', density: 'compact' })}>
			Current:
			{' '}
			{resolved.aesthetic}
			{' '}
			/
			{resolved.density}
		</button>
	);
}
```

## 6. Two-state light/dark control (no `system`)

`<ThemeToggle>` always includes `system`. For an explicit light/dark control, compose on the hook (about five lines).

```tsx
import { useTheme } from '@unbranded-ds/react';
import { SegmentedControl } from '@unbranded-ds/react';

function LightDarkToggle() {
	const { resolved, set } = useTheme();
	return (
		<SegmentedControl.Root
			aria-label="Color scheme"
			value={resolved.aesthetic}
			onValueChange={(value) => set({ aesthetic: value })}
		>
			<SegmentedControl.Item value="light">Light</SegmentedControl.Item>
			<SegmentedControl.Item value="dark">Dark</SegmentedControl.Item>
		</SegmentedControl.Root>
	);
}
```
