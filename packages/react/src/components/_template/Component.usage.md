# Button

A token-styled button with variant, size, and a polymorphic render slot.

(This file is the sidecar template. Copy it into a component directory, rename
to `<Component>.usage.md`, and replace Button-specific content with your
component's. The template uses Button as a working example so the
demonstrated voice and structure stay realistic.)

## When to use

Reach for Button when a user action belongs in a focused, tappable surface — a primary call to action, a destructive confirmation, an outline-styled secondary affordance, or a link-styled inline action. Pick the variant by intent (`default` for primary, `destructive` for irreversible actions, `outline` or `ghost` for secondary), and the size by surface density.

## Import

```tsx
import { Button } from '@unbranded-ds/react';
```

## Props

| Prop        | Type                                                                          | Default     | Description                                                                                                                                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `variant`   | `'default' \| 'destructive' \| 'outline' \| 'secondary' \| 'ghost' \| 'link'` | `'default'` | Pick by user intent. `'default'` for the primary action on a surface. `'destructive'` for actions that delete or otherwise can't be undone. `'outline'`, `'secondary'`, and `'ghost'` for de-emphasized choices. `'link'` for inline navigation. |
| `size`      | `'default' \| 'xs' \| 'sm' \| 'lg' \| 'icon'`                                 | `'default'` | Reach for `'sm'` or `'xs'` when the button sits in a dense toolbar; `'lg'` for a touch-friendly primary CTA; `'icon'` when the child is an icon with an `aria-label`.                                                                            |
| `disabled`  | `boolean`                                                                     | `false`     | Disables the button. Consumers should pair with a visible explanation when the disabled state isn't self-evident.                                                                                                                                |
| `className` | `string`                                                                      | —           | Merged with the variant classes via `cn()`. Override-friendly.                                                                                                                                                                                   |

## Common patterns

### Primary action

The default variant — the highest-priority action on a surface. One per region.

```tsx
import { Button } from '@unbranded-ds/react';

export function PrimaryAction() {
	return <Button>Save changes</Button>;
}
```

### Destructive confirmation

The `destructive` variant signals irreversibility. Pair it with a Dialog (or other confirmation pattern) so the action requires explicit consent.

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

## Accessibility

Button renders a native `<button>` element. It receives focus on Tab, activates on Enter or Space, and announces its accessible name (the button's text content) to assistive technology. When `disabled` is set, the button is removed from the focus order and announced as disabled.

For icon-only buttons (`size="icon"`), pass a descriptive `aria-label` so screen-reader users hear what the action does. The rendered SVG inside is decorative; the label carries the meaning.

## Variants and slots

CVA axes:

- `variant`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- `size`: `default`, `xs`, `sm`, `lg`, `icon`

Button has no compound slots; the component is rendered as a single element.

## Related

- [Dialog](../Dialog/Dialog.usage.md) — wrap a destructive button in a Dialog when the action can't be undone and you want explicit consent.
- [Tooltip](../Tooltip/Tooltip.usage.md) — pair with an icon-only Button to surface the action's label on hover and focus without crowding the surface.
