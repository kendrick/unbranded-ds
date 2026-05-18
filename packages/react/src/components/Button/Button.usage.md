# Button

A token-styled, accessible button with variant and size axes for matching intent to surface density.

## When to use

Reach for Button when a user action needs a focusable, tappable target. Pick the variant by intent: `default` for the primary action on a surface, `destructive` for irreversible operations, `outline` or `ghost` for secondary affordances, `secondary` for de-emphasized choices, and `link` for inline navigation that reads like text. Pick the size by the density of the surface it lives in.

## Import

```tsx
import { Button } from '@unbranded-ds/react';
```

## Props

| Prop        | Type                                                                                   | Default     | Description                                                                                                                                                                                              |
| ----------- | -------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant`   | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'`          | `'default'` | Controls visual weight and semantic intent. Use `'default'` for the one primary action per region, `'destructive'` for delete or hard-reset flows, and the lighter variants for secondary choices.        |
| `size`      | `'default' \| 'xs' \| 'sm' \| 'lg' \| 'icon' \| 'icon-xs' \| 'icon-sm' \| 'icon-lg'` | `'default'` | Sets height, padding, and (for icon sizes) a fixed square dimension. Use `'sm'` / `'xs'` in dense toolbars, `'lg'` for touch-friendly CTAs, and the `icon-*` variants when the child is a solo icon.     |
| `disabled`  | `boolean`                                                                              | —           | Removes the button from tab order and suppresses pointer events. Pair with a visible explanation when the reason isn't obvious from context.                                                              |
| `className` | `string`                                                                               | —           | Merged on top of variant classes via `cn()`. Useful for one-off spacing overrides without forking the component.                                                                                         |
| `children`  | `React.ReactNode`                                                                      | —           | Button label or icon. For icon-only buttons, children is the icon element and the accessible name comes from `aria-label`.                                                                                |

All other props (`onClick`, `type`, `form`, `aria-*`, etc.) forward directly to the underlying `<button>` element via Base UI's button primitive.

## Common patterns

### Primary action

The default variant is for the single highest-priority action on a surface. One `default` button per logical region keeps the hierarchy clear.

```tsx
import { Button } from '@unbranded-ds/react';

export function SaveAction() {
  return <Button>Save changes</Button>;
}
```

### Destructive confirmation

`destructive` signals that an action can't be undone. Wrap it in a Dialog (or another confirmation step) so the user acts intentionally, not accidentally.

```tsx
import { Button } from '@unbranded-ds/react';

export function DeleteAction() {
  return (
    <Button variant="destructive" size="sm">
      Delete account
    </Button>
  );
}
```

### Secondary and ghost buttons side by side

When a surface needs a primary action alongside a lower-priority one, pair `default` with `outline` or `ghost`. Ghost carries no border and no background, only a hover state, making it the quieter of the two secondary options.

```tsx
import { Button } from '@unbranded-ds/react';

export function ActionPair() {
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button variant="ghost">Cancel</Button>
      <Button>Confirm</Button>
    </div>
  );
}
```

### Icon-only button

Use `size="icon"` when the button holds a single icon. Always supply `aria-label` so screen-reader users hear what the action does; the SVG child is decorative and carries no accessible name on its own.

```tsx
import { Button } from '@unbranded-ds/react';

export function CloseButton() {
  return (
    <Button variant="ghost" size="icon" aria-label="Close panel">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </Button>
  );
}
```

### Link-styled inline action

`link` renders a button that reads like a hyperlink (underline on hover, no background) while keeping native button semantics: keyboard-activatable, part of the tab order, not a navigation anchor.

```tsx
import { Button } from '@unbranded-ds/react';

function openTerms() { /* open modal or navigate */ }

export function InlineAction() {
  return (
    <p>
      By continuing you agree to the{' '}
      <Button variant="link" onClick={() => openTerms()}>
        terms of service
      </Button>
      .
    </p>
  );
}
```

## Accessibility

Button renders a native `<button>` element via Base UI's button primitive. It receives focus on Tab, activates on Enter or Space, and announces its text content as the accessible name to assistive technology. When `disabled` is set, the button is removed from the tab order and announced as disabled.

For icon-only buttons (`size="icon"` or the sized `icon-*` variants), pass `aria-label` with a description of what the action does. The SVG child is decorative; the label carries the meaning. Skipping `aria-label` on an icon-only button leaves screen-reader users with no announcement.

The component adds `focus-visible:ring` and `focus-visible:border-ring` styles for keyboard-visible focus, meeting WCAG 2.4.7. When `aria-invalid` is set (for example, a submit button in a form with errors), the button picks up a red ring and border via its CVA classes.

## Variants and slots

CVA axes:

- `variant`: `default` (default), `destructive`, `outline`, `secondary`, `ghost`, `link`
- `size`: `default` (default), `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`

Button has no compound slots; it renders as a single element.
