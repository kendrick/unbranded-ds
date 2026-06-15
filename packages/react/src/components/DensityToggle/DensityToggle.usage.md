# DensityToggle

A segmented control over the density axis of `useTheme()`. Its segments are data-driven from the tokens registry, so a newly authored density value appears with no change here. There is no `system` segment, because density has no OS signal.

If you know next-themes, this is its mode-toggle pattern applied to a second axis through the multi-axis [useTheme](../../hooks/useTheme/useTheme.usage.md), where the full vocabulary mapping lives.

## When to use

Drop `<DensityToggle>` beside a `<ThemeToggle>` to expose the second theming axis. The two are independent, so a combination like vaporwave plus compact is simply the product of both controls rather than a bespoke variant. Must render inside a `<ThemeProvider>`.

## Import

```tsx
import { DensityToggle, ThemeProvider } from '@unbranded-ds/react';
```

## Props

| Prop          | Type                         | Default           | Description                                                                                            |
| ------------- | ---------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `labels`      | `Record<string, string>`     | English per value | Per-value label overrides, keyed by density value.                                                     |
| `icons`       | `Record<string, ReactNode>`  | none              | Per-value icons, keyed by density value. Density has no canonical icon, so labels are text by default. |
| `size`        | `'sm' \| 'md' \| 'lg'`       | `'md'`            | Forwarded to the underlying SegmentedControl.                                                          |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'`    | Forwarded to the underlying SegmentedControl.                                                          |
| `aria-label`  | `string`                     | `'Density'`       | Accessible name for the radiogroup.                                                                    |
| `className`   | `string`                     | —                 | Merged onto the root.                                                                                  |
| `id`          | `string`                     | —                 | Forwarded to the radiogroup root.                                                                      |

## Common patterns

### Beside a color-scheme toggle

```tsx
import { DensityToggle, ThemeProvider, ThemeToggle } from '@unbranded-ds/react';

export function ThemeControls() {
	return (
		<ThemeProvider>
			<ThemeToggle />
			<DensityToggle />
		</ThemeProvider>
	);
}
```

## Accessibility

The control renders a `radiogroup` named "Density" (override with `aria-label`) and one `radio` per available value, inheriting the SegmentedControl keyboard model. It shows no selected segment until mounted, then reflects the stored preference. When the density axis is forced by the provider, the control renders disabled.

## Related

- [ThemeToggle](../ThemeToggle/ThemeToggle.usage.md) — the color-scheme sibling; render it beside this one to compose axes.
- [SegmentedControl](../SegmentedControl/SegmentedControl.usage.md) — the primitive both toggles wrap.
