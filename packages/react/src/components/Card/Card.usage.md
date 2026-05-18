# Card

A surface container that groups related content and actions into a distinct visual unit.

## When to use

Use Card when you need to visually separate a chunk of information or a workflow step from surrounding content — a user profile summary, a settings panel, a pricing tier, a data summary. The component shines in grid layouts where multiple peers need consistent framing. Skip Card when the grouping is purely structural (use a plain `<section>` or `<div>`) or when you need interactive selection behavior (a clickable card pattern requires your own wrapper around the shell).

## Import

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@unbranded-ds/react';
```

## Props

### Card props

The root shell. Renders a `<div>` with `data-slot="card"` and owns the `size` variant. All child slots that respond to size pull from this element via the `group/card` context class.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'default' \| 'sm'` | `'default'` | Controls the spacing scale for the entire card tree. `'sm'` tightens gap and padding across Card, CardHeader, CardContent, and CardFooter simultaneously. Use when cards appear in dense grids or sidebars where the default spacing is too airy. |
| `className` | `string` | — | Merged with the card's base classes via `cn()`. Use to override max-width, background, or ring color on a per-instance basis. |
| `children` | `React.ReactNode` | — | The card tree. Compose with CardHeader, CardContent, and optionally CardFooter. |

All other `<div>` props (`id`, `style`, `aria-*`, etc.) pass through to the root element.

### CardHeader props

The header region. Renders a `<div>` with `data-slot="card-header"`. Its grid layout automatically expands to two columns when a `CardAction` is present — the title and description occupy the left column, the action occupies the right.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Merged with the header's grid layout classes. Rarely needed unless you're overriding padding or border-bottom spacing. |
| `children` | `React.ReactNode` | — | Typically `CardTitle`, optionally `CardDescription`, and optionally `CardAction`. |

All other `<div>` props pass through.

### CardTitle props

The card's display heading. Renders as a `<div>` (not an `<h2>` or `<h3>`) with `data-slot="card-title"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Merged with the title's typography classes. Use to adjust font size or weight when design calls for a variant that the `size` prop doesn't cover. |
| `children` | `React.ReactNode` | — | The heading text. |

All other `<div>` props pass through.

### CardDescription props

Supporting text beneath the title. Renders a `<div>` with `data-slot="card-description"` and muted foreground color.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Merged with the description's muted-text classes. |
| `children` | `React.ReactNode` | — | Brief explanatory text or metadata. Omit when the title alone is self-explanatory. |

All other `<div>` props pass through.

### CardContent props

The main body region. Renders a `<div>` with `data-slot="card-content"`. Horizontal padding tracks the card's `size` value.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Merged with the content's padding classes. Use to add vertical padding or override the horizontal inset. |
| `children` | `React.ReactNode` | — | Anything goes here: paragraphs, form fields, data tables, charts, images. |

All other `<div>` props pass through.

### CardFooter props

The footer action bar. Renders a `<div>` with `data-slot="card-footer"` and flex layout. Horizontal padding and optional top-border spacing track the card's `size` value.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Merged with the footer's flex layout classes. Use to add `gap`, change alignment, or apply `justify-between` for split-button layouts. |
| `children` | `React.ReactNode` | — | Action buttons. Pair with the `Button` component. A cancel-then-confirm ordering matches platform convention and is easiest for keyboard users. |

All other `<div>` props pass through.

### CardAction props

A pinned action slot in the header's top-right corner. Renders a `<div>` with `data-slot="card-action"`. When present, `CardHeader`'s grid shifts to two columns and `CardAction` spans both rows of the title/description column.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Merged with the positioning classes. Override only if you need to change the self-alignment or end-justification. |
| `children` | `React.ReactNode` | — | A button, icon button, badge, or any other inline action. Keep it compact — the column width adjusts to the content. |

All other `<div>` props pass through.

## Common patterns

### Header and content

The minimal useful composition: a title, optional description, and a body region.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@unbranded-ds/react';

export function SummaryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account summary</CardTitle>
        <CardDescription>Your current plan and usage at a glance.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>You have used 4 of 10 seats.</p>
      </CardContent>
    </Card>
  );
}
```

### Header, content, and footer

Add `CardFooter` when the card needs action buttons — the most common full-layout pattern.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@unbranded-ds/react';
import { Button } from '@unbranded-ds/react';

export function NotificationsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Choose which events you want to be notified about.</p>
      </CardContent>
      <CardFooter style={{ gap: '8px' }}>
        <Button variant="outline">Cancel</Button>
        <Button>Save</Button>
      </CardFooter>
    </Card>
  );
}
```

### Header with a pinned action button

`CardAction` is the right tool when you want a compact action anchored to the header rather than a full footer bar — a settings gear, a dismiss button, or a contextual overflow menu.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@unbranded-ds/react';
import { Button } from '@unbranded-ds/react';

export function AlertCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New message</CardTitle>
        <CardDescription>You have an unread message from your team.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">View</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Check your inbox for the latest update from the team channel.</p>
      </CardContent>
    </Card>
  );
}
```

### Dense layout with `size="sm"`

Switch to `size="sm"` in grid contexts — dashboard panels, sidebar widgets — where the default spacing leaves cards feeling too tall.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@unbranded-ds/react';

export function DenseCard() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Storage</CardTitle>
      </CardHeader>
      <CardContent>
        <p>12.4 GB of 50 GB used</p>
      </CardContent>
    </Card>
  );
}
```

## Accessibility

Card itself is a non-interactive container. It carries no ARIA role by default and is not focusable, so screen readers treat it as ordinary flow content.

`CardTitle` renders as a `<div>`, not a semantic heading element. This is intentional — the component doesn't know where it lives in the document outline, so it leaves heading level to the consumer. When heading hierarchy matters (most product pages), pass a heading element as `children`:

```tsx
import { Card, CardHeader, CardTitle } from '@unbranded-ds/react';

export function AccessibleCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle><h2>Account summary</h2></CardTitle>
      </CardHeader>
    </Card>
  );
}
```

Alternatively, render the card section inside a landmarks-based layout where the surrounding `<section>` or `<article>` provides the accessible region label.

If a card contains interactive elements (buttons, form fields, links), those elements carry their own keyboard and screen-reader semantics. No additional work is needed on the card shell. Avoid making the entire card surface clickable with an `onClick` on `Card` — that produces an undiscoverable keyboard target with no ARIA role. Use a `<a>` or `<button>` inside the card body instead.

## Variants and slots

### Variants

Card exposes one CVA variant axis:

| Variant | Values | Default | Effect |
| --- | --- | --- | --- |
| `size` | `'default' \| 'sm'` | `'default'` | Scales gap and padding across the entire card tree via `data-[size=sm]` attribute propagation. `CardHeader`, `CardContent`, and `CardFooter` all read the parent's `data-size` value through Tailwind's group modifier. |

### Slots

- `Card` — the root shell; owns the `size` variant and the `group/card` context class.
- `CardHeader` — grid layout region for title, description, and optional action.
- `CardTitle` — display text for the card's subject; renders as a `<div>`.
- `CardDescription` — muted supporting text beneath the title.
- `CardContent` — the primary body region; receives the card's horizontal padding.
- `CardFooter` — flex layout region for action buttons at the card's bottom edge.
- `CardAction` — a pinned slot that anchors to the header's top-right corner when rendered inside `CardHeader`.
