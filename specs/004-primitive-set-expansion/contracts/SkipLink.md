# Contract: SkipLink

Public API exposed by `@unbranded-ds/react`'s SkipLink, as exported from `packages/react/src/components/SkipLink/index.ts` and re-exported from `packages/react/src/index.ts`.

## Type signature

```ts
import type * as React from 'react';

interface SkipLinkProps {
	targetId?: string; // default 'main'
	children?: React.ReactNode; // default 'Skip to main content'
	className?: string;
}

declare const SkipLink: React.FC<SkipLinkProps>;

export { SkipLink };
export type { SkipLinkProps };
```

## Composition rules

- `SkipLink` is rendered as the first focusable element on a page, typically inside the layout's outermost wrapper before navigation.
- Multiple `SkipLink` instances may be rendered on the same page, each with its own `targetId`. Each instance is independent.
- The component takes no opinion on how multiple instances stack visually. Layout is the consumer's responsibility.

## Behavior contract

- Renders as a native `<a href="#${targetId}">` element
- Visually hidden via the `.sr-only` utility (from spec 002) when not focused
- Visible when focused, via a `:focus-visible` CSS reveal — no JS required
- Activation (Enter key or click) relies on native browser anchor behavior: scroll to and focus the matching element
- Component does NOT call `preventDefault()` and does NOT perform programmatic scroll
- If `targetId` references a non-existent element, activation is a no-op. The component does not throw or emit a warning; this is a graceful-degradation choice, since a missing target is a consumer misconfiguration that should never break the page.

## What this contract does NOT cover

- Smooth-scroll behavior: applies CSS `scroll-behavior: smooth` on `html` or `body` if desired, but the component does not configure this.
- Custom scroll offset for fixed headers: a consumer-side concern; handle with CSS `scroll-margin-top` on the target element.
- Automatic injection of the `id="main"` attribute on the consumer's main content element. The consumer must add this themselves.
