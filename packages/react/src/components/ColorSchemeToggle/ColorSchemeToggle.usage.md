# ColorSchemeToggle

A drop-in color-scheme control: a fixed light / system / dark segmented control wired to the `colorScheme` axis of `useTheme()`. Persisted, system-aware, keyboard-navigable, and accessible.

If you know next-themes' mode toggle, this is the same idea built on the multi-axis [useTheme](../../hooks/useTheme/useTheme.usage.md), where the full next-themes vocabulary mapping lives.

## When to use

Reach for `ColorSchemeToggle` when an app wants the familiar light / system / dark switch and you would otherwise rebuild it: localStorage persistence, an `auto`-style `system` option that follows the OS, and a flash-free first paint when paired with the spec-002 bootstrap. It must render inside a `<ThemeProvider>`, which owns the state.

Color scheme is its own axis (spec 016), so this control never collides with the aesthetic identity. To switch identities (default, brand, vaporwave) drop a `<ThemeToggle>` beside it; for density, a `<DensityToggle>`. The three compose, so a combination like a brand identity in dark at compact density falls out of three independent controls rather than a bespoke variant. For any other shape (a switch, a dropdown, a two-state light/dark control with no `system`), compose on `useTheme()` directly; the recipe below shows the two-state case.

## Import

```tsx
import { ColorSchemeToggle, ThemeProvider } from '@unbranded-ds/react';
```

## Props

| Prop          | Type                                                        | Default              | Description                                   |
| ------------- | ----------------------------------------------------------- | -------------------- | --------------------------------------------- |
| `labels`      | `Partial<Record<'light' \| 'system' \| 'dark', string>>`    | English              | Per-segment label overrides.                  |
| `icons`       | `Partial<Record<'light' \| 'system' \| 'dark', ReactNode>>` | Sun / SunMoon / Moon | Per-segment icon overrides (lucide defaults). |
| `size`        | `'sm' \| 'md' \| 'lg'`                                      | `'md'`               | Forwarded to the underlying SegmentedControl. |
| `orientation` | `'horizontal' \| 'vertical'`                                | `'horizontal'`       | Forwarded to the underlying SegmentedControl. |
| `aria-label`  | `string`                                                    | `'Color scheme'`     | Accessible name for the radiogroup.           |
| `className`   | `string`                                                    | —                    | Merged onto the root.                         |
| `id`          | `string`                                                    | —                    | Forwarded to the radiogroup root.             |

## Common patterns

### Drop-in

The control owns nothing; state lives in the provider. Pair the provider with `themeBootstrapScript` (spec 002) for a flash-free reload.

```tsx
import { ColorSchemeToggle, ThemeProvider } from '@unbranded-ds/react';

export function App() {
	return (
		<ThemeProvider>
			<ColorSchemeToggle />
		</ThemeProvider>
	);
}
```

### Two-state light/dark (no system)

`<ColorSchemeToggle>` always includes a `system` segment. When you want an explicit light/dark control with no `system`, compose on `useTheme()` (about five lines). The `colorScheme` convenience keeps it terse.

```tsx
import { SegmentedControl, useTheme } from '@unbranded-ds/react';

export function LightDarkToggle() {
	const { colorScheme } = useTheme();
	return (
		<SegmentedControl.Root
			aria-label="Color scheme"
			value={colorScheme.resolved}
			onValueChange={colorScheme.set}
		>
			<SegmentedControl.Item value="light">Light</SegmentedControl.Item>
			<SegmentedControl.Item value="dark">Dark</SegmentedControl.Item>
		</SegmentedControl.Root>
	);
}
```

## Accessibility

The control renders a `radiogroup` with an accessible name (`aria-label`, defaulting to "Color scheme") and one `radio` per segment, inheriting the SegmentedControl keyboard model (arrow keys on-axis, Home/End, Space to select). Until the component mounts it shows no selected segment, so the server render and the first client render agree and there is no layout shift; the selected segment appears on mount. When the color-scheme axis is forced by the provider, the control renders disabled.

## Related

- [ThemeToggle](../ThemeToggle/ThemeToggle.usage.md) — the sibling control for the aesthetic identity axis; render it beside this one to switch identities.
- [DensityToggle](../DensityToggle/DensityToggle.usage.md) — the sibling control for the density axis; render it beside this one to compose axes.
- [SegmentedControl](../SegmentedControl/SegmentedControl.usage.md) — the primitive all the toggles wrap, and the base for custom controls built on `useTheme()`.
