# Quickstart: Primitive set expansion

Minimal working examples for the four new components in `@unbranded-ds/react@0.3.0`. Each example aims for five lines or fewer of import-and-use code (SC-001).

## Install

```bash
pnpm add @unbranded-ds/react@^0.3.0 @unbranded-ds/tokens@^0.2.0 @base-ui-components/react react react-dom
```

Wire the Tailwind preset once (already done if you migrated from 0.1.0 per spec 002):

```css
@import 'tailwindcss';
@import '@unbranded-ds/react/preset.css';
```

## Tooltip

```tsx
import { Tooltip } from '@unbranded-ds/react';

<Tooltip.Provider>
  <Tooltip.Trigger>Hover me</Tooltip.Trigger>
  <Tooltip.Content>Helpful detail</Tooltip.Content>
</Tooltip.Provider>
```

### Wrapping an inline element (citation pattern)

```tsx
<Tooltip.Provider>
  <sup>
    <Tooltip.Trigger asChild>
      <a href="#source-P-04">[P-04]</a>
    </Tooltip.Trigger>
  </sup>
  <Tooltip.Content>Spencer interview, NPR 2017</Tooltip.Content>
</Tooltip.Provider>
```

`asChild` passes the trigger props onto the existing `<a>`, so the original markup is preserved.

### Positioning

```tsx
<Tooltip.Content side="right" align="start">Detail</Tooltip.Content>
```

Defaults are `side="top"` and `align="center"`.

## SkipLink

```tsx
import { SkipLink } from '@unbranded-ds/react';

<SkipLink>Skip to main content</SkipLink>
<main id="main">...</main>
```

### Multiple skip targets

```tsx
<SkipLink targetId="main">Skip to main</SkipLink>
<SkipLink targetId="nav">Skip to navigation</SkipLink>
<SkipLink targetId="footer">Skip to footer</SkipLink>
```

Layout the instances however you want — the component takes no layout opinion.

## Slider

### Single-value

```tsx
import { Slider } from '@unbranded-ds/react';

<Slider.Root defaultValue={[50]} min={0} max={100}>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
    </Slider.Track>
    <Slider.Thumb />
  </Slider.Control>
</Slider.Root>
```

### Range (two-thumb)

```tsx
<Slider.Root defaultValue={[20, 80]} min={0} max={100}>
  <Slider.Control>
    <Slider.Track>
      <Slider.Indicator />
    </Slider.Track>
    <Slider.Thumb />
    <Slider.Thumb />
  </Slider.Control>
</Slider.Root>
```

### Controlled

```tsx
const [value, setValue] = useState<number[]>([50]);

<Slider.Root value={value} onValueChange={setValue}>
  <Slider.Control>
    <Slider.Track><Slider.Indicator /></Slider.Track>
    <Slider.Thumb />
  </Slider.Control>
</Slider.Root>
```

`value` is always `number[]` — single is `[50]`, range is `[20, 80]`. `onValueChange` receives the same shape.

## SegmentedControl

```tsx
import { SegmentedControl } from '@unbranded-ds/react';

<SegmentedControl.Root defaultValue="medium">
  <SegmentedControl.Item value="small">S</SegmentedControl.Item>
  <SegmentedControl.Item value="medium">M</SegmentedControl.Item>
  <SegmentedControl.Item value="large">L</SegmentedControl.Item>
</SegmentedControl.Root>
```

### Controlled with onValueChange

```tsx
const [size, setSize] = useState('medium');

<SegmentedControl.Root value={size} onValueChange={setSize}>
  <SegmentedControl.Item value="small">S</SegmentedControl.Item>
  <SegmentedControl.Item value="medium">M</SegmentedControl.Item>
  <SegmentedControl.Item value="large">L</SegmentedControl.Item>
</SegmentedControl.Root>
```

## Variants

The shared variant axes apply where they're meaningful:

```tsx
<Slider.Root size="lg" orientation="vertical">...</Slider.Root>
<SegmentedControl.Root size="sm" orientation="horizontal">...</SegmentedControl.Root>
```

`disabled` is supported on Slider and SegmentedControl Roots, and per-item on `SegmentedControl.Item`.

## Common compositions

### Slider with tooltip showing current value

```tsx
<Slider.Root value={value} onValueChange={setValue}>
  <Slider.Control>
    <Slider.Track><Slider.Indicator /></Slider.Track>
    <Tooltip.Provider>
      <Tooltip.Trigger asChild>
        <Slider.Thumb />
      </Tooltip.Trigger>
      <Tooltip.Content>{value[0]}</Tooltip.Content>
    </Tooltip.Provider>
  </Slider.Control>
</Slider.Root>
```

Combines the inline-element pattern (`asChild` on a Slider.Thumb) with a tooltip that reflects the controlled value.

## Bundle size

The combined gzipped size for the four components together targets under 8 KB. Each component is tree-shakeable, so importing only what you use keeps the cost proportional.

## SSR

All four components are safe to render server-side (Constitution Section IX bullet 6 — added in 1.0.2 alongside this spec). They access `window` and `document` only inside post-mount effects, never at render time. Next.js, Remix, and other SSR frameworks should work without `'use client'` boundaries on these wrappers, though framework-level rules may still require the directive on consumer code that uses state.

## Errors and warnings

If you pass invalid props, the component does not throw — it clamps to a sensible value and emits a structured warning to `console.warn` for dev-tool and agent consumption:

```text
[unbranded-ds] { component: 'Slider', issue: 'value-out-of-range', prop: 'value', got: 150, clamped: 100 }
```

The second argument to `console.warn` is always a plain object with at least `{ component, issue }`.
