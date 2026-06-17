# SegmentedControl

A mutually-exclusive selection control rendered as a connected pill, backed by a radiogroup.

## When to use

Use SegmentedControl when a user must pick exactly one option from a small, fixed set and the options benefit from being visible side by side at all times. It fits well in toolbars, view-switchers, and filter bars where two to five options are equally weighted and the current selection should always stay visible.

Prefer Tabs when the selected item controls which content panel is displayed beneath it — SegmentedControl has no associated panel concept. Prefer Select (or a native `<select>`) when the option list is long, changes dynamically, or needs to be hidden until the user opens it. Prefer Switch for a single on/off state.

## Import

```tsx
import { SegmentedControl } from '@unbranded-ds/react';
```

## Props

### SegmentedControl.Root props

The root element. Renders a Base UI `RadioGroup` and manages selection state, keyboard navigation, and context propagation to child Items.

| Prop            | Type                         | Default        | Description                                                                                                                                                                         |
| --------------- | ---------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string`                     | —              | The controlled selected value. When set, the consumer owns selection state and must update it from `onValueChange` for the selection to visually change. Pair with `onValueChange`. |
| `defaultValue`  | `string`                     | —              | Seeds the selected value for uncontrolled usage. Pass either `defaultValue` or `value`, not both.                                                                                   |
| `onValueChange` | `(value: string) => void`    | —              | Fires with the newly selected string when the user picks an item via click or keyboard.                                                                                             |
| `size`          | `'sm' \| 'md' \| 'lg'`       | `'md'`         | Controls item height, horizontal padding, and font size across all child Items.                                                                                                     |
| `orientation`   | `'horizontal' \| 'vertical'` | `'horizontal'` | Lays items in a row (horizontal) or column (vertical). Also determines which arrow keys move focus — Left/Right for horizontal, Up/Down for vertical.                               |
| `disabled`      | `boolean`                    | `false`        | When `true`, the entire control is non-interactive. Sets `aria-disabled="true"` on the root and suppresses pointer events.                                                          |
| `className`     | `string`                     | —              | Extra classes merged onto the root via `cn()`.                                                                                                                                      |
| `children`      | `React.ReactNode`            | —              | One or more `SegmentedControl.Item` children. Renders a dev warning if no children are present.                                                                                     |

### SegmentedControl.Item props

A single selectable segment. Renders a Base UI `Radio.Root` with the size and orientation it reads from context.

| Prop        | Type              | Default | Description                                                                                                                                      |
| ----------- | ----------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `value`     | `string`          | —       | **Required.** The value this item represents. Matched against the Root's `value` or `defaultValue` to determine the checked state.               |
| `disabled`  | `boolean`         | `false` | When `true`, this item is non-interactive while the rest of the control remains active. Sets `aria-disabled` and `data-disabled` on the element. |
| `className` | `string`          | —       | Extra classes merged onto the item via `cn()`.                                                                                                   |
| `children`  | `React.ReactNode` | —       | The visible label. Can include text, an icon, or both.                                                                                           |

## Common patterns

### Uncontrolled with a default selection

The simplest case: pass `defaultValue` and let the component own state internally. Use this when no external code needs to react to or drive the selection.

```tsx
import { SegmentedControl } from '@unbranded-ds/react';

export function ViewSwitcher() {
	return (
		<SegmentedControl.Root defaultValue="week">
			<SegmentedControl.Item value="day">Day</SegmentedControl.Item>
			<SegmentedControl.Item value="week">Week</SegmentedControl.Item>
			<SegmentedControl.Item value="month">Month</SegmentedControl.Item>
		</SegmentedControl.Root>
	);
}
```

### Controlled selection

When external logic needs to read or drive the selection — a URL param, a keyboard shortcut, a server response — manage `value` yourself with `useState`.

```tsx
import { SegmentedControl } from '@unbranded-ds/react';
import * as React from 'react';

export function ControlledViewSwitcher() {
	const [view, setView] = React.useState('week');

	return (
		<SegmentedControl.Root value={view} onValueChange={setView}>
			<SegmentedControl.Item value="day">Day</SegmentedControl.Item>
			<SegmentedControl.Item value="week">Week</SegmentedControl.Item>
			<SegmentedControl.Item value="month">Month</SegmentedControl.Item>
		</SegmentedControl.Root>
	);
}
```

### Vertical orientation

Pass `orientation="vertical"` to stack items in a column. Up/Down arrows navigate the vertical axis; Left/Right are no-ops.

```tsx
import { SegmentedControl } from '@unbranded-ds/react';

export function VerticalFilter() {
	return (
		<SegmentedControl.Root defaultValue="all" orientation="vertical">
			<SegmentedControl.Item value="all">All</SegmentedControl.Item>
			<SegmentedControl.Item value="active">Active</SegmentedControl.Item>
			<SegmentedControl.Item value="archived">Archived</SegmentedControl.Item>
		</SegmentedControl.Root>
	);
}
```

### Per-item disabled state

Disable individual items to signal that an option exists but is unavailable in the current context, without hiding it entirely.

```tsx
import { SegmentedControl } from '@unbranded-ds/react';

export function SizeSelector() {
	return (
		<SegmentedControl.Root defaultValue="md" size="sm">
			<SegmentedControl.Item value="sm">S</SegmentedControl.Item>
			<SegmentedControl.Item value="md">M</SegmentedControl.Item>
			<SegmentedControl.Item value="lg">L</SegmentedControl.Item>
			<SegmentedControl.Item value="xl" disabled>XL</SegmentedControl.Item>
		</SegmentedControl.Root>
	);
}
```

## Accessibility

The Root renders with `role="radiogroup"` (via Base UI's RadioGroup) and each Item renders with `role="radio"`. Screen readers announce the group and its options using the WAI-ARIA radiogroup pattern.

Arrow-key navigation follows the orientation. A horizontal control responds to Left and Right arrows; a vertical control responds to Up and Down. Cross-axis keys are intercepted and swallowed in the capture phase before Base UI's composite handler sees them, so they are genuine no-ops rather than silent pass-throughs. Both orientations respond to Home (jump to the first enabled item) and End (jump to the last enabled item).

When an item is focused via keyboard, selection moves with focus — the focused item becomes the checked radio. Clicking a disabled item has no effect; keyboard navigation skips over it. An item with `disabled={true}` carries both `aria-disabled` and `data-disabled`, so CSS and assistive technology agree on its state.

The Root propagates `aria-orientation` so assistive technology can confirm which axis the group uses. When the entire control is disabled, the Root sets `aria-disabled="true"` at the group level, which announces the group as a whole as non-interactive.

## Variants and slots

`SegmentedControl` is exported as a plain object with two keys:

- `SegmentedControl.Root` — the radiogroup container; owns selection state, keyboard handling, and size/orientation context.
- `SegmentedControl.Item` — a single radio segment; reads size and orientation from context so those props don't need to be repeated at every leaf.

Two CVA helpers drive the visual treatment:

`segmentedControlRootVariants` has `size` (`sm` | `md` | `lg`, default `md`), `orientation` (`horizontal` | `vertical`, default `horizontal`), and `disabled` (`true` | `false`, default `false`) axes.

`segmentedControlItemVariants` has `size` (`sm` | `md` | `lg`, default `md`) and `orientation` (`horizontal` | `vertical`, default `horizontal`) axes. Items receive these values from Root's context rather than directly from props.

## Related

- [Tabs](../Tabs/Tabs.usage.md) — use Tabs instead when the selected item controls a content panel beneath it; SegmentedControl has no panel concept.
- [Select](../Select/Select.usage.md) — use Select when the option set is long, dynamic, or needs to stay hidden until the user opens it.
- [Switch](../Switch/Switch.usage.md) — use Switch for a single on/off binary state; SegmentedControl handles two or more named options.
- [Slider](../Slider/Slider.usage.md) — use Slider when the options are continuous or finely stepped rather than discrete named values.
