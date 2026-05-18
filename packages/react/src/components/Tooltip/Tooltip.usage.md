# Tooltip

A floating label that surfaces short contextual information when a user hovers, focuses, or taps an element.

## When to use

Use Tooltip to surface short contextual information when a user hovers, focuses, or taps an element. Common cases include citation hovers in editorial content and label clarifications on icon-only buttons.

## Import

```tsx
import { Tooltip } from '@unbranded-ds/react';
```

## Props

### Tooltip.Provider props

The configuration boundary. Every `Tooltip.Trigger` and `Tooltip.Content` pair must be a descendant of a `Tooltip.Provider`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `delayDuration` | `number` | `700` | Hover delay before the tooltip opens, in milliseconds. Keyboard focus bypasses this and opens immediately. Lower values suit icon-heavy UIs where users pause briefly; raise it to avoid flicker on dense toolbars. |
| `container` | `HTMLElement \| null` | `document.body` | Portal mount target for `Tooltip.Content`. Defaults to `document.body`, which lets the tooltip escape ancestors with `overflow: hidden` or `overflow: clip`. Pass a different element when a fixed parent owns the stacking context you want to land in. |
| `onOpenChange` | `(open: boolean) => void` | — | Fires when the open state changes from any source — hover, keyboard focus, tap, Escape, or outside press. Use this for analytics or to sync external state. |
| `children` | `React.ReactNode` | — | The tooltip tree. Must contain both a `Tooltip.Trigger` and a `Tooltip.Content`. |

### Tooltip.Trigger props

The element that opens the tooltip. Renders a `<button>` by default.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `asChild` | `boolean` | `false` | When `true`, forwards trigger behavior to the single child element instead of wrapping it in a `<button>`. Required for citation patterns like `<sup><a/>` where injecting an extra `<button>` would break the DOM structure or create a nested-interactive violation. |
| `className` | `string` | — | Applied to the trigger element (or merged with the child's className when `asChild` is set). |
| `children` | `React.ReactNode` | — | The trigger content. |

### Tooltip.Content props

The floating panel that appears near the trigger.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | Which edge of the trigger the content anchors against. Base UI flips this automatically when the chosen edge would clip against the viewport. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment of the content along the chosen side. `'start'` and `'end'` align to the leading and trailing edges of the trigger; `'center'` centers along the axis. |
| `className` | `string` | — | Merged with the default panel classes via `cn()`. Use to adjust max-width or typography on a per-tooltip basis. |
| `children` | `React.ReactNode` | — | The tooltip text or content. Keep it short — tooltips are glanceable labels, not paragraphs. |

## Common patterns

### Basic tooltip

The most common shape: a provider wrapping a single trigger and content pair. The provider defaults to a 700 ms hover delay, so lower it during development to avoid waiting.

```tsx
import { Tooltip } from '@unbranded-ds/react';

export function SaveButton() {
  return (
    <Tooltip.Provider>
      <Tooltip.Trigger>Save</Tooltip.Trigger>
      <Tooltip.Content>Saves your changes immediately</Tooltip.Content>
    </Tooltip.Provider>
  );
}
```

### Wrapping an inline element

When you want a tooltip on a non-button inline element — a citation marker, an abbreviation, an icon anchor — pass `asChild` to the trigger so the wrapper doesn't inject an extra `<button>` around your element. Base UI's `render` prop swaps the underlying element, preserving your original DOM tag and its existing event handlers.

```tsx
import { Tooltip } from '@unbranded-ds/react';

export function CitationTooltip() {
  return (
    <p>
      Reading text with a footnote
      <sup>
        <Tooltip.Provider>
          <Tooltip.Trigger asChild>
            <a href="#source-1" className="ml-0.5 text-primary underline">
              [1]
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content>Source: Smith et al., 2024</Tooltip.Content>
        </Tooltip.Provider>
      </sup>
      {' '}and more body text after it.
    </p>
  );
}
```

### Custom positioning

Use `side` and `align` on `Tooltip.Content` to anchor the panel where it fits best. Base UI flips the side automatically when the chosen edge would overflow the viewport, so this is a preference rather than a hard constraint.

```tsx
import { Tooltip } from '@unbranded-ds/react';

export function PositionedTooltip() {
  return (
    <Tooltip.Provider>
      <Tooltip.Trigger>Right-anchored</Tooltip.Trigger>
      <Tooltip.Content side="right" align="start">
        Anchored to the right, start-aligned
      </Tooltip.Content>
    </Tooltip.Provider>
  );
}
```

### Delayed open

The default 700 ms delay prevents tooltips from flickering as the pointer crosses a busy toolbar. In an icon-only button bar where users pause to identify controls, a shorter delay (200–300 ms) feels more responsive without causing noise.

```tsx
import { Tooltip } from '@unbranded-ds/react';

export function QuickTooltip() {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Trigger>Icon button</Tooltip.Trigger>
      <Tooltip.Content>Opens at 200 ms</Tooltip.Content>
    </Tooltip.Provider>
  );
}
```

### Tracking open state

Pass `onOpenChange` to `Tooltip.Provider` when you need to know whether the tooltip is open — for analytics, to conditionally render something, or to sync with external state.

```tsx
import * as React from 'react';
import { Tooltip } from '@unbranded-ds/react';

export function TrackedTooltip() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Tooltip.Provider onOpenChange={setIsOpen}>
      <Tooltip.Trigger>Track me</Tooltip.Trigger>
      <Tooltip.Content>Tooltip is {isOpen ? 'open' : 'closed'}</Tooltip.Content>
    </Tooltip.Provider>
  );
}
```

## Accessibility

The tooltip opens when the trigger receives keyboard focus — this happens immediately, without waiting for the hover delay. On pointer devices, the configured `delayDuration` applies before the panel appears. On touch devices, tapping the trigger toggles the tooltip open and closed.

Pressing Escape closes the tooltip and returns focus to the trigger. This matches the ARIA Authoring Practices Guide pattern for tooltips, where the disclosure is non-blocking and the keyboard user can dismiss it without leaving their current position.

The content element carries `role="tooltip"`, which tells assistive technology to announce it as a tooltip rather than a live region or dialog. The trigger is automatically wired to the content via `aria-describedby`, so screen readers read the tooltip text when the trigger receives focus — no manual wiring is required.

When `prefers-reduced-motion: reduce` is active, the open and close transitions are skipped entirely per WCAG SC 2.3.3. The `motion-reduce:transition-none` and `motion-reduce:duration-0` classes on the popup handle this without any consumer configuration.

## Variants and slots

Tooltip has no CVA variant axes. Its positioning comes from the `side` and `align` props on `Tooltip.Content`, which are pass-through props to Base UI's Positioner rather than CVA axes.

### Slots

- `Tooltip.Provider` — configuration boundary; sets the hover delay, portal container, and open-change callback for the pair it wraps.
- `Tooltip.Trigger` — the element that opens the tooltip on hover, focus, or tap.
- `Tooltip.Content` — the floating panel; portals to `document.body` by default so it can escape clipping ancestors.
