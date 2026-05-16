# Contract: SegmentedControl

Public API exposed by `@unbranded-ds/react`'s SegmentedControl, as exported from `packages/react/src/components/SegmentedControl/index.ts` and re-exported from `packages/react/src/index.ts`.

## Type signatures

```ts
import type * as React from 'react';

interface SegmentedControlRootProps {
	value?: string; // controlled
	defaultValue?: string; // uncontrolled
	onValueChange?: (value: string) => void;
	size?: 'sm' | 'md' | 'lg'; // default 'md'
	orientation?: 'horizontal' | 'vertical'; // default 'horizontal'
	disabled?: boolean; // default false
	children: React.ReactNode;
	className?: string;
}

interface SegmentedControlItemProps {
	value: string; // required
	disabled?: boolean; // default false (per-item disable)
	children: React.ReactNode;
	className?: string;
}

declare const SegmentedControl: {
	Root: React.FC<SegmentedControlRootProps>;
	Item: React.FC<SegmentedControlItemProps>;
};

export { SegmentedControl };
export type { SegmentedControlItemProps, SegmentedControlRootProps };
```

## Composition rules

- `<SegmentedControl.Root>` holds one or more `<SegmentedControl.Item>` children
- Each Item MUST have a unique `value` string
- The Root accepts `value` (controlled) OR `defaultValue` (uncontrolled), not both

## Behavior contract

### Selection

- Exactly one Item is selected at a time
- Click on an Item → that Item becomes selected, the previously selected Item deselects
- `onValueChange` fires with the new selected value

### Keyboard (FR-025, strict axis)

| Orientation | Key                      | Effect                                 |
| ----------- | ------------------------ | -------------------------------------- |
| Horizontal  | Left Arrow / Right Arrow | Move focus and selection between Items |
| Horizontal  | Up Arrow / Down Arrow    | No-op                                  |
| Vertical    | Up Arrow / Down Arrow    | Move focus and selection between Items |
| Vertical    | Left Arrow / Right Arrow | No-op                                  |
| Both        | Home                     | Jump to first Item                     |
| Both        | End                      | Jump to last Item                      |

### ARIA (FR-024)

- `<SegmentedControl.Root>` exposes `role="radiogroup"`
- Each `<SegmentedControl.Item>` exposes `role="radio"` with `aria-checked` reflecting selection
- Disabled Root or Item: `aria-disabled="true"`

### Edge cases

- Fewer than three Items: renders normally with no warning (per spec edge case; the "three or more" guidance is advisory)
- Zero Items: renders an empty wrapper and emits `console.warn('[unbranded-ds]', { component: 'SegmentedControl', issue: 'no-items' })`
- Duplicate `value` strings across Items: Base UI's RadioGroup behavior applies (the first match wins for selection); not enforced or warned by the wrapper

## What this contract does NOT cover

- Multi-select. This is a single-select control by ARIA semantics; for multi-select, compose `<Checkbox>` elements instead.
- Item-with-icon-only is supported (Item children accept any `ReactNode`), but the accessible name is the consumer's responsibility — add `aria-label` on the Item if children are purely decorative.
- Animated indicator that visually slides between selected Items — out of scope for 0.3.0; consumers can layer this on via CSS if desired.
