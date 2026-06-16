# ThemeToggle

The aesthetic-identity control: a segmented control over the `theme` axis of `useTheme()` (default / brand / vaporwave). Its segments are data-driven from the tokens registry, so a newly registered identity appears with no change here.

If you know next-themes, this drives what next-themes calls the `theme` — the named look — built on the multi-axis [useTheme](../../hooks/useTheme/useTheme.usage.md), where the full vocabulary mapping lives.

## When to use

Reach for `ThemeToggle` when an app wants to switch the aesthetic identity (the palette, type, and shadows that make "brand" feel like the brand) and you would otherwise rebuild the registry-driven segmented control yourself. It must render inside a `<ThemeProvider>`, which owns the state.

It is the identity sibling of `<ColorSchemeToggle>` (light / dark / system) and `<DensityToggle>` (comfortable / compact). Spec 016 split identity and color scheme into separate axes, so each control drives its own attribute and the three compose without collision — a brand identity, in dark, at compact density falls out of three independent controls. Unlike `<ColorSchemeToggle>`, this control has no `system` segment, because an aesthetic identity has no OS signal.

## Import

```tsx
import { ThemeProvider, ThemeToggle } from '@unbranded-ds/react';
```

## Props

| Prop          | Type                         | Default        | Description                                         |
| ------------- | ---------------------------- | -------------- | --------------------------------------------------- |
| `labels`      | `Record<string, string>`     | English        | Per-value label overrides, keyed by identity value. |
| `icons`       | `Record<string, ReactNode>`  | —              | Per-value icons, keyed by identity value.           |
| `size`        | `'sm' \| 'md' \| 'lg'`       | `'md'`         | Forwarded to the underlying SegmentedControl.       |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Forwarded to the underlying SegmentedControl.       |
| `aria-label`  | `string`                     | `'Theme'`      | Accessible name for the radiogroup.                 |
| `className`   | `string`                     | —              | Merged onto the root.                               |
| `id`          | `string`                     | —              | Forwarded to the radiogroup root.                   |

## Common patterns

### Drop-in

The control owns nothing; state lives in the provider.

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

### A custom identity appears automatically

The segments come from `themesForAxis('theme')`, so registering an identity at runtime with `registerTheme(theme, 'theme')` surfaces a new segment with no change to the control. See the `DataDrivenValues` story for a working example that registers a "sunset" identity.

## Accessibility

The control renders a `radiogroup` with an accessible name (`aria-label`, defaulting to "Theme") and one `radio` per identity, inheriting the SegmentedControl keyboard model (arrow keys on-axis, Home/End, Space to select). Until the component mounts it shows no selected segment, so the server render and the first client render agree and there is no layout shift; the selected segment appears on mount. When the theme axis is forced by the provider, the control renders disabled.

## Related

- [ColorSchemeToggle](../ColorSchemeToggle/ColorSchemeToggle.usage.md) — the sibling control for light / dark / system; render it beside this one.
- [DensityToggle](../DensityToggle/DensityToggle.usage.md) — the sibling control for the density axis.
- [SegmentedControl](../SegmentedControl/SegmentedControl.usage.md) — the primitive all the toggles wrap.
