# Data Model: Primitive set expansion

This document describes the structural model — components, slot composition, props, internal state, events — for the four new primitives. There is no persisted data; the "model" here is React component shape.

## Tooltip

**Composition**: `<Tooltip.Provider>` wraps one or more `<Tooltip.Trigger>` + `<Tooltip.Content>` pairs. Wraps Base UI's Tooltip primitives.

### Slot components

| Slot                 | Underlying Base UI | Role                                                       |
| -------------------- | ------------------ | ---------------------------------------------------------- |
| `<Tooltip.Provider>` | `Tooltip.Provider` | Configuration boundary (delayDuration, portal container)   |
| `<Tooltip.Trigger>`  | `Tooltip.Trigger`  | The element that opens the tooltip on hover, focus, or tap |
| `<Tooltip.Content>`  | `Tooltip.Content`  | The floating panel                                         |

### Props — Provider

| Prop            | Type                      | Default         | Notes                            |
| --------------- | ------------------------- | --------------- | -------------------------------- |
| `delayDuration` | `number`                  | `700`           | Hover-open delay in milliseconds |
| `container`     | `HTMLElement \| null`     | `document.body` | Portal mount target              |
| `onOpenChange`  | `(open: boolean) => void` | —               | Pass-through from Base UI        |

### Props — Trigger

| Prop        | Type      | Default | Notes                                                                         |
| ----------- | --------- | ------- | ----------------------------------------------------------------------------- |
| `asChild`   | `boolean` | `false` | When true, passes props to the single child instead of injecting a `<button>` |
| `className` | `string`  | —       | Merged via `cn()`                                                             |

### Props — Content

| Prop        | Type                                     | Default    | Notes                        |
| ----------- | ---------------------------------------- | ---------- | ---------------------------- |
| `side`      | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'`    | Position relative to trigger |
| `align`     | `'start' \| 'center' \| 'end'`           | `'center'` | Alignment along the side     |
| `className` | `string`                                 | —          | Merged via `cn()`            |

### State

Open / closed, managed entirely by Base UI. The wrapper does not introduce wrapper-controlled state.

### Events

The wrapper does not add new events. Base UI's `onOpenChange` on the Provider is exposed.

### Behavior contracts

- Touch: inherits Base UI's default tap-to-toggle with outside-tap dismissal (FR-007)
- Reduced motion: Tailwind `motion-reduce:transition-none motion-reduce:duration-0` applied to Content open and close (FR-004)
- Portal: Content portals to `document.body` by default, escaping `overflow: hidden` ancestors (FR-008)

---

## SkipLink

**Composition**: A single component, not slot-based. Renders a native `<a href="#${targetId}">` element underneath.

### Props

| Prop        | Type        | Default                  | Notes                              |
| ----------- | ----------- | ------------------------ | ---------------------------------- |
| `targetId`  | `string`    | `'main'`                 | The `id` of the element to jump to |
| `children`  | `ReactNode` | `'Skip to main content'` | The link text                      |
| `className` | `string`    | —                        | Merged via `cn()`                  |

### State

No internal state. Visibility is driven by the CSS `:focus-visible` pseudo-class, not by component state.

### Events

Native anchor `onClick`. The wrapper does NOT call `preventDefault()`. Native browser anchor navigation handles focus and scroll on activation.

### Behavior contracts

- Visually hidden until focused, using the `.sr-only` utility (FR-009)
- Revealed on `:focus-visible` (FR-009)
- Activation moves keyboard focus and viewport scroll to the target element via browser-native behavior (FR-011)
- Multiple instances on the same page work independently; the wrapper takes no layout opinion (FR-013)
- If `targetId` references a non-existent element, activation is a no-op — no throw, no warning

---

## Slider

**Composition**: `<Slider.Root>` contains a `<Slider.Control>`, which contains a `<Slider.Track>` (optionally wrapping a `<Slider.Indicator>`) and one or two `<Slider.Thumb>` elements. Wraps Base UI's Slider primitives.

### Slot components

| Slot                 | Underlying Base UI | Role                                                                |
| -------------------- | ------------------ | ------------------------------------------------------------------- |
| `<Slider.Root>`      | `Slider.Root`      | Container; holds value state                                        |
| `<Slider.Control>`   | `Slider.Control`   | The interactive surface where pointer and touch events are captured |
| `<Slider.Track>`     | `Slider.Track`     | Visual track background                                             |
| `<Slider.Indicator>` | `Slider.Indicator` | Filled portion of the track                                         |
| `<Slider.Thumb>`     | `Slider.Thumb`     | Draggable handle; one for single-value, two for range               |

### Props — Root

| Prop            | Type                         | Default        | Notes                                               |
| --------------- | ---------------------------- | -------------- | --------------------------------------------------- |
| `value`         | `number[]`                   | —              | Controlled. Single-value: `[50]`; range: `[20, 80]` |
| `defaultValue`  | `number[]`                   | `[min]`        | Uncontrolled                                        |
| `min`           | `number`                     | `0`            | Lower bound (inclusive)                             |
| `max`           | `number`                     | `100`          | Upper bound (inclusive)                             |
| `step`          | `number`                     | `1`            | Increment for keyboard and drag                     |
| `onValueChange` | `(value: number[]) => void`  | —              | Fired on every value change                         |
| `size`          | `'sm' \| 'md' \| 'lg'`       | `'md'`         | CVA size axis                                       |
| `orientation`   | `'horizontal' \| 'vertical'` | `'horizontal'` | CVA orientation axis                                |
| `disabled`      | `boolean`                    | `false`        | Disables drag, keyboard, and focus on thumbs        |
| `className`     | `string`                     | —              | Merged via `cn()`                                   |

### Props — Control, Track, Indicator, Thumb

All accept `className` (merged via `cn()`). Track accepts `children` (commonly the Indicator). Thumb is self-closing.

### Validation behavior (FR-020)

- A `value[i]` outside `[min, max]` is clamped to the nearest valid value. Emits `console.warn('[unbranded-ds]', { component: 'Slider', issue: 'value-out-of-range', prop: 'value', got, clamped })`
- `step <= 0` falls back to `1`. Emits `{ component: 'Slider', issue: 'invalid-step', got, fallback: 1 }`
- `min >= max` swaps to `[min, min+1]`. Emits `{ component: 'Slider', issue: 'invalid-bounds', min, max, swappedTo }`
- Component never throws on invalid props

### Keyboard (FR-018)

| Key                     | Effect                                                     |
| ----------------------- | ---------------------------------------------------------- |
| Arrow Up / Arrow Right  | Increment focused thumb by `step`                          |
| Arrow Down / Arrow Left | Decrement focused thumb by `step`                          |
| Home                    | Jump focused thumb to `min`                                |
| End                     | Jump focused thumb to `max`                                |
| PageUp                  | Increment by 10% of `(max - min)`, rounded to nearest step |
| PageDown                | Decrement by 10% of `(max - min)`, rounded to nearest step |

### Touch (FR-019)

- Tap on track → focused thumb jumps to tapped position
- Drag a thumb with finger → continuous value change
- All input modes (pointer, keyboard, touch) resolve to the same `onValueChange` pathway

### Range thumb collision

When dragging one thumb past another, the dragged thumb stops at the other's current value minus one step. The thumbs cannot cross.

### ARIA (FR-021)

- Each thumb exposes `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Range mode: each thumb has independent ARIA values

---

## SegmentedControl

**Composition**: `<SegmentedControl.Root>` contains two or more `<SegmentedControl.Item>` children. Wraps Base UI's RadioGroup primitives.

### Slot components

| Slot                      | Underlying Base UI | Role                            |
| ------------------------- | ------------------ | ------------------------------- |
| `<SegmentedControl.Root>` | `RadioGroup.Root`  | Container; holds selected value |
| `<SegmentedControl.Item>` | `RadioGroup.Item`  | A single option                 |

### Props — Root

| Prop            | Type                         | Default        | Notes                               |
| --------------- | ---------------------------- | -------------- | ----------------------------------- |
| `value`         | `string`                     | —              | Controlled selected value           |
| `defaultValue`  | `string`                     | —              | Uncontrolled initial selected value |
| `onValueChange` | `(value: string) => void`    | —              | Fired on selection change           |
| `size`          | `'sm' \| 'md' \| 'lg'`       | `'md'`         | CVA size axis                       |
| `orientation`   | `'horizontal' \| 'vertical'` | `'horizontal'` | CVA orientation axis                |
| `disabled`      | `boolean`                    | `false`        | Disables all items                  |
| `className`     | `string`                     | —              | Merged via `cn()`                   |

### Props — Item

| Prop        | Type        | Default | Notes                                    |
| ----------- | ----------- | ------- | ---------------------------------------- |
| `value`     | `string`    | —       | Required. The value this item represents |
| `disabled`  | `boolean`   | `false` | Per-item disable                         |
| `children`  | `ReactNode` | —       | Visible label                            |
| `className` | `string`    | —       | Merged via `cn()`                        |

### ARIA (FR-024)

- `<SegmentedControl.Root>` exposes `role="radiogroup"`
- Each `<SegmentedControl.Item>` exposes `role="radio"` with `aria-checked`
- Disabled Root or Item: `aria-disabled="true"`

### Keyboard (FR-025, strict axis)

| Orientation | Key                      | Effect                                 |
| ----------- | ------------------------ | -------------------------------------- |
| Horizontal  | Left Arrow / Right Arrow | Move focus and selection between items |
| Horizontal  | Up Arrow / Down Arrow    | No-op                                  |
| Vertical    | Up Arrow / Down Arrow    | Move focus and selection between items |
| Vertical    | Left Arrow / Right Arrow | No-op                                  |
| Both        | Home                     | Jump to first item                     |
| Both        | End                      | Jump to last item                      |

### Edge cases

- Fewer than three items: renders normally, no warning (per spec edge case; the "three or more" guidance is advisory)
- Zero items: renders empty wrapper, emits `console.warn('[unbranded-ds]', { component: 'SegmentedControl', issue: 'no-items' })`

---

## Cross-component invariants

- Slot names match Base UI's exactly (FR-036)
- Variant prop names use the shared vocabulary `variant`, `size`, `intent`, `disabled` (FR-037); no bespoke synonyms
- All wrappers are SSR-safe: no `window`, `document`, or other browser-only global access at render time (Constitution Section IX bullet 6)
- All structured warnings use `console.warn('[unbranded-ds]', payload)` with `payload` shaped as `{ component, issue, ... }` (FR-034)
