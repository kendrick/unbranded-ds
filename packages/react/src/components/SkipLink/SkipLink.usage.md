# SkipLink

A visually hidden anchor that jumps keyboard users past navigation to a named landmark on the page.

## When to use

Place a SkipLink at the very top of a layout when navigation or other repeated content precedes the main region. Keyboard-only users and screen-reader users can activate it to skip a long nav block and land directly at the target — without tabbing through every link first. Any page whose primary content is not the first focusable region benefits from one.

## Import

```tsx
import { SkipLink } from '@unbranded-ds/react';
```

## Props

| Prop        | Type                | Default                    | Description                                                                                                                                               |
| ----------- | ------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `targetId`  | `string`            | `'main'`                   | The `id` of the element to land on when the link is activated. The rendered `<a>` receives an `href` of `#${targetId}`. Point this at whatever landmark receives the skip. |
| `children`  | `React.ReactNode`   | `'Skip to main content'`   | The visible label shown when the link has focus. Screen readers announce this label whether the link is visible or not, so keep it descriptive.           |
| `className` | `string`            | —                          | Extra Tailwind utilities merged via `cn()`. Use this to adjust the focus-revealed treatment (position, color, size) without replacing the hidden baseline. |

## Common patterns

### Placement at the top of a layout

The SkipLink must come before any navigation in DOM order so it is the first focusable element on the page. Pairing it with a `<main id="main">` is the minimal setup.

```tsx
import { SkipLink } from '@unbranded-ds/react';

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <SkipLink />
      <nav aria-label="Primary">
        {/* navigation links */}
      </nav>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
    </body>
  );
}
```

### Custom target id

When the page's primary content region uses an id other than `"main"`, pass `targetId` to match it.

```tsx
import { SkipLink } from '@unbranded-ds/react';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <SkipLink targetId="content">Skip to content</SkipLink>
      <nav aria-label="Primary">{/* nav links */}</nav>
      <div id="content" tabIndex={-1}>
        {children}
      </div>
    </body>
  );
}
```

### Multiple skip targets

When a page has several distinct landmark regions — navigation, main content, footer — multiple SkipLink instances can each point at their own target. They render in DOM order and each becomes focusable in turn.

```tsx
import { SkipLink } from '@unbranded-ds/react';

export function RichLayout({ children }: { children: React.ReactNode }) {
  return (
    <body>
      <SkipLink targetId="main">Skip to main content</SkipLink>
      <SkipLink targetId="search">Skip to search</SkipLink>
      <nav id="nav" aria-label="Primary" tabIndex={-1}>{/* nav */}</nav>
      <form id="search" role="search" tabIndex={-1}>{/* search */}</form>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
    </body>
  );
}
```

## Accessibility

SkipLink renders a native `<a>` element. At rest it carries Tailwind's `sr-only` class, keeping it off-screen and out of the visual flow for sighted users. The moment the anchor receives keyboard focus, `focus-visible:not-sr-only` removes `sr-only` and a set of fixed-position styles reveal the link in the upper-left of the viewport at a high `z-index`, so it appears above navigation even in complex layouts.

Activation follows standard browser anchor behavior: the browser scrolls the target element into view and moves focus to it. No JavaScript intercepts the click or keypress. This means the target element must be focusable — either a natively focusable element (`<main>`, `<section>`, headings are not focusable by default) or one with `tabIndex={-1}` added. Without a focusable target, most browsers will scroll but not shift focus, which defeats the assistive purpose.

Screen readers announce the link label whether or not the link is in the visual layout. The default label `"Skip to main content"` meets the WCAG SC 2.4.1 (Bypass Blocks) criterion's recommendation for descriptive link text. When you change `children`, keep the label short and specific to the landmark it targets.

Multiple SkipLink instances on one page are valid. The component takes no opinion on how stacked instances position relative to each other — all will share the same `focus-visible:top-2 focus-visible:left-2` coordinates, so only the focused one is visible at any given moment.

## Variants and slots

No CVA variant axes. No compound slots; the component is rendered as a single element.
