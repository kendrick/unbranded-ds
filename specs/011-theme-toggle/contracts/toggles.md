# Contract: `<ThemeToggle>` and `<DensityToggle>`

Two thin, named sibling controls over `useTheme()` and `SegmentedControl`. Neither takes `value`/`onChange`: state comes from the provider, the `next-themes` mode-toggle model. Render one, both, or neither.

## Import

```ts
import { DensityToggle, ThemeToggle } from '@unbranded-ds/react';
```

## Shared props

Both forward to `SegmentedControl.Root` and accept:

```ts
interface SharedToggleProps {
	'size'?: 'sm' | 'md' | 'lg'; // forwarded; default 'md'
	'orientation'?: 'horizontal' | 'vertical'; // forwarded; default 'horizontal'
	'aria-label'?: string; // accessible group name
	'className'?: string;
	// ...rest spreads onto SegmentedControl.Root
}
```

`SegmentedControl` exposes `size` and `orientation` (not `variant`), so the toggles forward those.

## `<ThemeToggle>` (color-scheme, aesthetic axis)

```ts
type ColorScheme = 'light' | 'system' | 'dark';

interface ThemeToggleProps extends SharedToggleProps {
	labels?: Partial<Record<ColorScheme, string>>; // default: Light / System / Dark
	icons?: Partial<Record<ColorScheme, React.ReactNode>>; // default: Sun / SunMoon / Moon (lucide)
}
```

- Renders three fixed segments (light/system/dark) wired to the `aesthetic` axis. Segments are fixed, not derived from `available` (FR-010).
- When the aesthetic value is `brand` or `vaporwave`, no segment is selected and the control stays enabled; selecting a segment overwrites the aesthetic value.
- Default `aria-label`: `"Color scheme"`.

## `<DensityToggle>` (density axis)

```ts
interface DensityToggleProps extends SharedToggleProps {
	labels?: Record<string, string>; // keyed by density value; defaults English per value
	icons?: Record<string, React.ReactNode>; // keyed by density value; lucide defaults
}
```

- Renders one segment per value in `available.density` (FR-012), so a newly authored value (such as `expanded`) appears with no component change, labeled by the raw value when no override is given.
- No `system` segment, since density has no OS signal.
- Default `aria-label`: `"Density"`.

## Behavior shared by both

- A toggle bound to a `forced` axis renders disabled (FR-014).
- Until mounted, the control renders unresolved (no segment selected), then reflects the stored preference, so there is no hydration mismatch and no layout shift (FR-008).
- Selecting a segment calls `set({ [axis]: value })`. For other UX (a switch, a dropdown, a two-state light/dark control), compose on `useTheme()` directly; see [quickstart.md](../quickstart.md).
