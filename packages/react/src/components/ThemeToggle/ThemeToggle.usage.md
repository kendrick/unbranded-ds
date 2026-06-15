# ThemeToggle

A drop-in color-scheme control: a fixed light / system / dark segmented control wired to the aesthetic axis of `useTheme()`. Persisted, system-aware, keyboard-navigable, and accessible.

If you know next-themes' mode toggle, this is the same idea built on the multi-axis [useTheme](../../hooks/useTheme/useTheme.usage.md), where the full next-themes vocabulary mapping lives.

## When to use

Reach for `ThemeToggle` when an app wants the familiar light / system / dark switch and you would otherwise rebuild it: localStorage persistence, an `auto`-style `system` option that follows the OS, and a flash-free first paint when paired with the spec-002 bootstrap. It must render inside a `<ThemeProvider>`, which owns the state.

For a second axis (density), drop a `<DensityToggle>` beside it; the two compose, so a combination like vaporwave plus compact falls out of two independent controls rather than a bespoke variant. For any other shape (a switch, a dropdown, a two-state light/dark control with no `system`), compose on `useTheme()` directly; the recipe below shows the two-state case.

## Import

```tsx
import { ThemeProvider, ThemeToggle } from '@unbranded-ds/react';
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
import { ThemeProvider, ThemeToggle } from '@unbranded-ds/react';

export function App() {
	return (
		<ThemeProvider>
			<ThemeToggle />
		</ThemeProvider>
	);
}
```

### Two-state light/dark (no system)

`<ThemeToggle>` always includes a `system` segment. When you want an explicit light/dark control with no `system`, compose on `useTheme()` (about five lines).

```tsx
import { SegmentedControl, useTheme } from '@unbranded-ds/react';

export function LightDarkToggle() {
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

## Accessibility

The control renders a `radiogroup` with an accessible name (`aria-label`, defaulting to "Color scheme") and one `radio` per segment, inheriting the SegmentedControl keyboard model (arrow keys on-axis, Home/End, Space to select). Until the component mounts it shows no selected segment, so the server render and the first client render agree and there is no layout shift; the selected segment appears on mount. When the aesthetic axis is forced by the provider, the control renders disabled.

## Related

- [DensityToggle](../DensityToggle/DensityToggle.usage.md) — the sibling control for the density axis; render it beside this one to compose axes.
- [SegmentedControl](../SegmentedControl/SegmentedControl.usage.md) — the primitive both toggles wrap, and the base for custom controls built on `useTheme()`.
