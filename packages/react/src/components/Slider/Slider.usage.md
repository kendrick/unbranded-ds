# Slider

A draggable numeric input for picking a value or a value range from a bounded scale.

## When to use

Reach for Slider when the exact number matters less than its position within a range, and when the range itself is continuous or finely stepped. A volume control, a brightness dial, or a price-range filter all fit this pattern. Prefer a numeric Input when the user needs to type an exact figure without scanning a track. Prefer a Select when the options are discrete and meaningful by name rather than by position on a scale.

## Import

```tsx
import { Slider } from '@unbranded-ds/react';
```

## Props

### Slider.Root props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number[]` | — | Controlled value. A single-thumb slider passes `[50]`; a range slider passes `[20, 80]`. Pair with `onValueChange` to own the value yourself. Values outside `[min, max]` are clamped at render time and a structured warning is emitted. |
| `defaultValue` | `number[]` | — | Uncontrolled initial value. Same array shape as `value`. Use this when you don't need to read or drive the value from parent state. |
| `min` | `number` | `0` | Lower bound of the value range, inclusive. When `min >= max` the component clamps to `[min, min + 1]` and warns. |
| `max` | `number` | `100` | Upper bound of the value range, inclusive. |
| `step` | `number` | `1` | Increment applied by keyboard and drag. Values at or below zero fall back to `1` with a structured warning. PageUp/PageDown move 10% of the range rounded to the nearest step. |
| `onValueChange` | `(value: number[]) => void` | — | Fires on every change. Receives the new value as `number[]`, matching the shape of `value` and `defaultValue`. Base UI's event-details object is stripped; the array is all you need. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Visual size axis. Affects track height and thumb diameter. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout axis. Horizontal sliders stretch along the inline axis; vertical sliders along the block axis. |
| `disabled` | `boolean` | `false` | Blocks drag, keyboard interaction, and focus on the thumbs. The slider still renders with the current value. |
| `className` | `string` | — | Additional classes merged onto the root element via `cn()`. |

### Slider.Control props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Additional classes merged via `cn()`. |

`Slider.Control` is the positioning wrapper that holds `Slider.Track` and the thumb(s) in alignment. It inherits the remaining Base UI `Slider.Control` props (e.g., `ref`) and passes them through.

### Slider.Track props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Additional classes merged via `cn()`. |

`Slider.Track` is the bar background that gives the slider its visual rail. It inherits the remaining Base UI `Slider.Track` props and passes them through.

### Slider.Indicator props

Inherits all props from Base UI's `Slider.Indicator`. Reach for this slot only when you need to suppress the filled range or replace it with a custom visual — omitting it from the tree hides the fill entirely.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Additional classes merged via `cn()`. |

### Slider.Thumb props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Additional classes merged via `cn()`. |

Add one `Slider.Thumb` per value: a single-thumb slider renders one, a range slider renders two. `Slider.Thumb` inherits the remaining Base UI `Slider.Thumb` props (e.g., `aria-label`) and passes them through.

## Common patterns

### Basic single-thumb slider

The minimal composition: a root with bounds and a default value, the control/track/indicator/thumb nesting below it.

```tsx
import { Slider } from '@unbranded-ds/react';

export function BasicSlider() {
  return (
    <div style={{ width: '320px' }}>
      <Slider.Root defaultValue={[50]} min={0} max={100} step={1}>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
          </Slider.Track>
          <Slider.Thumb />
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
```

### Controlled slider with a value readout

When the parent needs to read or drive the current value, pass `value` and `onValueChange`. Render the value alongside the slider so users with low vision can confirm the exact figure.

```tsx
import { useState } from 'react';
import { Slider } from '@unbranded-ds/react';

export function ControlledSlider() {
  const [value, setValue] = useState<number[]>([42]);
  return (
    <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Slider.Root value={value} onValueChange={setValue}>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
          </Slider.Track>
          <Slider.Thumb />
        </Slider.Control>
      </Slider.Root>
      <output>{`Value: ${value[0]}`}</output>
    </div>
  );
}
```

### Range slider (two thumbs)

Pass two values in `defaultValue` and render two `Slider.Thumb` elements. Base UI manages which thumb responds to a given interaction based on proximity.

```tsx
import { Slider } from '@unbranded-ds/react';

export function RangeSlider() {
  return (
    <div style={{ width: '320px' }}>
      <Slider.Root defaultValue={[20, 80]}>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
          </Slider.Track>
          <Slider.Thumb />
          <Slider.Thumb />
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
```

### Vertical orientation

Set `orientation="vertical"` on the root. The track grows along the block axis and the height is driven by the `size` prop (`sm: 160px`, `md: 192px`, `lg: 224px`).

```tsx
import { Slider } from '@unbranded-ds/react';

export function VerticalSlider() {
  return (
    <div style={{ height: '240px' }}>
      <Slider.Root defaultValue={[50]} orientation="vertical">
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
          </Slider.Track>
          <Slider.Thumb />
        </Slider.Control>
      </Slider.Root>
    </div>
  );
}
```

## Accessibility

Each `Slider.Thumb` renders with `role="slider"` and exposes `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` to assistive technology. Screen readers announce the current value as the thumb moves.

Keyboard interaction on a focused thumb:

- **ArrowRight / ArrowUp** — increment by one `step`
- **ArrowLeft / ArrowDown** — decrement by one `step`
- **Home** — jump to `min`
- **End** — jump to `max`
- **PageUp** — increment by 10% of the range, rounded to the nearest `step`
- **PageDown** — decrement by 10% of the range, rounded to the nearest `step`

The 10% large-step is recomputed from the actual range rather than relying on Base UI's fixed default of 10. A slider with `min=0 max=200` moves 20 per PageUp/PageDown, not 10.

When `disabled` is `true`, all thumbs are removed from the focus order and pointer/touch events are suppressed. The visible slider remains in the DOM at its current value so the disabled state is legible to sighted users.

For range sliders, give each `Slider.Thumb` an `aria-label` that describes which bound it controls (e.g., `"Minimum price"`, `"Maximum price"`) so screen-reader users understand which thumb they're adjusting.

## Variants and slots

`Slider.Root` has three CVA axes: `size` (`sm | md | lg`, default `md`), `orientation` (`horizontal | vertical`, default `horizontal`), and `disabled` (`true | false`, default `false`).

`Slider.Thumb` mirrors the `size` axis (`sm | md | lg`, default `md`) so thumb diameter stays in proportion with track height when `size` is set on the root.

### Slots

- `Slider.Root` — **required.** The state container. Sets bounds, step, orientation, and disabled state for every descendant via Base UI's context.
- `Slider.Control` — **required.** Positioning wrapper that aligns the track and thumbs on the correct axis.
- `Slider.Track` — **required.** The bar background. Every composition needs exactly one track inside the control.
- `Slider.Indicator` — optional. The filled segment between the origin and the thumb (or between two thumbs in range mode). Omit it if you want an unfilled track.
- `Slider.Thumb` — **required.** The draggable handle. Render one per value: one for a single-thumb slider, two for a range slider. Each thumb carries its own ARIA attributes.

## Related

- [Input](../Input/Input.usage.md) — use Input when the user needs to type an exact numeric value rather than scan a continuous track.
- [SegmentedControl](../SegmentedControl/SegmentedControl.usage.md) — use SegmentedControl when the options are discrete named values rather than a position on a scale.
