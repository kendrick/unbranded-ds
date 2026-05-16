# Contract: Tooltip

Public API exposed by `@unbranded-ds/react`'s Tooltip, as exported from `packages/react/src/components/Tooltip/index.ts` and re-exported from `packages/react/src/index.ts`.

## Type signatures

```ts
import type * as React from 'react';

interface TooltipProviderProps {
	children?: React.ReactNode;
	delayDuration?: number; // default 700ms
	container?: HTMLElement | null; // portal target, default document.body
	onOpenChange?: (open: boolean) => void;
}

interface TooltipTriggerProps {
	asChild?: boolean; // default false
	children?: React.ReactNode;
	className?: string;
}

interface TooltipContentProps {
	side?: 'top' | 'right' | 'bottom' | 'left'; // default 'top'
	align?: 'start' | 'center' | 'end'; // default 'center'
	children?: React.ReactNode;
	className?: string;
}

declare const Tooltip: {
	Provider: React.FC<TooltipProviderProps>;
	Trigger: React.FC<TooltipTriggerProps>;
	Content: React.FC<TooltipContentProps>;
};

export { Tooltip };
export type { TooltipContentProps, TooltipProviderProps, TooltipTriggerProps };
```

## Composition rules

- `Tooltip.Trigger` and `Tooltip.Content` MUST be descendants of a `Tooltip.Provider`. Rendering them outside throws via Base UI.
- One `Tooltip.Provider` hosts one Trigger and one Content. The wrapper collapses Base UI's `Provider` + `Root` into the single `Tooltip.Provider` slot, so each tooltip instance gets its own Provider. Consumers needing several tooltips render several Providers.
- `Tooltip.Trigger asChild` requires exactly one child element. Multiple or zero children throw a React error from Base UI.
- TypeScript marks `children` as optional on all three slot prop interfaces. Storybook's `Meta<typeof Tooltip.Provider>` inference treats `args` as partial, so requiring `children` at the type level produced spurious typecheck errors in stories whose `render` function supplies children directly. Runtime usage still requires the slot composition; the type relaxation is only an authoring concern.

## Behavior contract

- Hover the Trigger → Content opens after `delayDuration` ms
- Focus the Trigger via keyboard → Content opens immediately, no delay
- Escape while Content is open → Content closes, focus stays on Trigger
- Tap the Trigger on touch → Content toggles (tap-to-toggle); tap outside → Content closes
- `prefers-reduced-motion: reduce` → open and close transitions are instant via Tailwind `motion-reduce:` override
- Content portals to `document.body` by default, escaping ancestor `overflow: hidden`

## What this contract does NOT cover

- Z-index stacking is deferred to a future z-index token spec. Consumers override via CSS if needed.
- Animation curves and durations beyond `motion-reduce` are Tailwind built-ins for now; DS motion tokens land after spec 006.
- Authored a11y label for the trigger when `asChild` wraps a non-interactive element — the consumer is responsible for ensuring the child element is focusable and has an accessible name.
