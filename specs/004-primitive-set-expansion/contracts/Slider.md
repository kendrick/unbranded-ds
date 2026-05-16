# Contract: Slider

Public API exposed by `@unbranded-ds/react`'s Slider, as exported from `packages/react/src/components/Slider/index.ts` and re-exported from `packages/react/src/index.ts`.

## Type signatures

```ts
import type * as React from 'react';

interface SliderRootProps {
	value?: number[]; // controlled; e.g. [50] or [20, 80]
	defaultValue?: number[]; // uncontrolled
	min?: number; // default 0
	max?: number; // default 100
	step?: number; // default 1
	onValueChange?: (value: number[]) => void;
	size?: 'sm' | 'md' | 'lg'; // default 'md'
	orientation?: 'horizontal' | 'vertical'; // default 'horizontal'
	disabled?: boolean; // default false
	children?: React.ReactNode;
	className?: string;
}

interface SliderControlProps {
	children?: React.ReactNode;
	className?: string;
}

interface SliderTrackProps {
	children?: React.ReactNode;
	className?: string;
}

interface SliderIndicatorProps {
	className?: string;
}

interface SliderThumbProps {
	className?: string;
}

declare const Slider: {
	Root: React.FC<SliderRootProps>;
	Control: React.FC<SliderControlProps>;
	Track: React.FC<SliderTrackProps>;
	Indicator: React.FC<SliderIndicatorProps>;
	Thumb: React.FC<SliderThumbProps>;
};

export { Slider };
export type {
	SliderControlProps,
	SliderIndicatorProps,
	SliderRootProps,
	SliderThumbProps,
	SliderTrackProps,
};
```

## Composition rules

- Single-value: one `<Slider.Thumb>` inside `<Slider.Control>`
- Range (two-thumb): two `<Slider.Thumb>` elements inside `<Slider.Control>`
- `<Slider.Indicator>` is optional. Include it when a filled-portion visualization is desired; omit for a thumb-only slider.
- `<Slider.Track>` can hold the `<Slider.Indicator>` as a child or render the Indicator as a sibling, depending on the layout the design calls for.
- TypeScript marks `children` as optional on `Slider.Root` and `Slider.Control` for the same Storybook-typing reason noted in the Tooltip contract. Runtime composition still requires the slot tree.

## Value shape

- `value` and `defaultValue` are ALWAYS `number[]`
- Single-value usage: `[50]`
- Range usage: `[20, 80]`
- `onValueChange` receives the same shape

## Behavior contract

### Validation (FR-020)

- `value[i]` outside `[min, max]` → clamped to nearest valid value, emits `console.warn('[unbranded-ds]', { component: 'Slider', issue: 'value-out-of-range', prop: 'value', got, clamped })`
- `step <= 0` → falls back to `1`, emits `{ component: 'Slider', issue: 'invalid-step', got, fallback: 1 }`
- `min >= max` → swaps to `[min, min+1]`, emits `{ component: 'Slider', issue: 'invalid-bounds', min, max, swappedTo }`
- Component never throws on invalid props

### Keyboard (FR-018)

| Key                     | Effect                                                     |
| ----------------------- | ---------------------------------------------------------- |
| Arrow Up / Arrow Right  | Increment by `step`                                        |
| Arrow Down / Arrow Left | Decrement by `step`                                        |
| Home                    | Jump to `min`                                              |
| End                     | Jump to `max`                                              |
| PageUp                  | Increment by 10% of `(max - min)`, rounded to nearest step |
| PageDown                | Decrement by 10% of `(max - min)`, rounded to nearest step |

### Touch (FR-019)

- Tap on track → focused thumb jumps to tapped position
- Drag a thumb with finger → continuous value change
- All input modes (pointer, keyboard, touch) resolve to the same `onValueChange` pathway

### Range collision

When dragging one thumb past another, the dragged thumb stops at the other's current value minus one step. The thumbs cannot cross.

### ARIA (FR-021)

- Each thumb exposes `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Range mode: each thumb carries its own ARIA values independently

### Disabled state

- No drag, no keyboard, no focus on thumbs
- Each thumb carries `aria-disabled="true"`

## What this contract does NOT cover

- Visible numeric value labels — the consumer renders these via a separate node if needed; the Slider itself does not include a label slot
- Tooltip-on-thumb showing current value — compose with `<Tooltip>` over a `<Slider.Thumb>` if desired
- Tick marks or visible track stops — out of scope for 0.3.0
