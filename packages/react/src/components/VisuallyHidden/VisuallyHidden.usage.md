# VisuallyHidden

Renders content in the DOM that assistive technology can announce while keeping it invisible to sighted users.

## When to use

Reach for `VisuallyHidden` when text needs to exist in the accessibility tree but must not appear on screen. Icon-only buttons are the common starting point: the icon conveys meaning visually, but a screen reader needs text to announce. Unlike `aria-label`, which attaches a label string to an element without any DOM presence, `VisuallyHidden` places real text in the document — text a refreshable braille display can read and a user can copy-paste. Prefer it over `aria-label` when the content has standalone meaning or when you want it to remain selectable.

## Import

```tsx
import { VisuallyHidden } from '@unbranded-ds/react';
```

## Props

| Prop        | Type                                                    | Default  | Description                                                                                                                                           |
| ----------- | ------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `as`        | `keyof JSX.IntrinsicElements`                           | `'span'` | The underlying HTML element to render. Use `'div'` when a `<span>` would be invalid in the surrounding context (e.g., wrapping block-level children). |
| `children`  | `React.ReactNode`                                       | —        | The content to hide visually. Stays present in the accessibility tree.                                                                                |
| `className` | `string`                                                | —        | Merged with the built-in `sr-only` class via `cn()`. Useful for adding layout context like `contents` when needed.                                    |
| `...rest`   | `React.ComponentPropsWithoutRef<T>` (minus owned props) | —        | All other props forward to the underlying element. Useful for `id` when pairing with `aria-describedby`, or `data-*` attributes for test selectors.   |

## Common patterns

### Icon-only button label

An icon button needs an accessible name. Placing `VisuallyHidden` text inside the button gives screen readers something to announce without adding visible text that would change the button's layout.

```tsx
import { VisuallyHidden } from '@unbranded-ds/react';
import { Settings } from 'lucide-react';

export function SettingsButton() {
	return (
		<button type="button">
			<Settings aria-hidden="true" />
			<VisuallyHidden>Open settings</VisuallyHidden>
		</button>
	);
}
```

### Accessible description via aria-describedby

When a form field or interactive element needs supplemental context that sighted users can infer from layout, give the `VisuallyHidden` element an `id` and point the control at it with `aria-describedby`. The description stays out of the visual flow while remaining available to screen readers.

```tsx
import { VisuallyHidden } from '@unbranded-ds/react';

export function PasswordField() {
	return (
		<div>
			<label htmlFor="password">Password</label>
			<input
				id="password"
				type="password"
				aria-describedby="password-hint"
			/>
			<VisuallyHidden id="password-hint">
				Must be at least 8 characters and include a number.
			</VisuallyHidden>
		</div>
	);
}
```

### Block-level wrapper via as prop

A `<span>` is invalid as a parent of block-level elements like headings. Pass `as="div"` when the hidden content has block-level children so the rendered HTML stays valid.

```tsx
import { VisuallyHidden } from '@unbranded-ds/react';

export function SectionWithHiddenHeading() {
	return (
		<section>
			<VisuallyHidden as="div">
				<h2>Related articles</h2>
			</VisuallyHidden>
			{/* visually styled cards here */}
		</section>
	);
}
```

### Screen-reader-only heading for a landmark

Landmark regions (`<nav>`, `<aside>`, `<section>`) announce better with a label. When a design has no visible heading for the region, a hidden heading gives screen readers a name without cluttering the visual hierarchy.

```tsx
import { VisuallyHidden } from '@unbranded-ds/react';

export function SiteNav() {
	return (
		<nav aria-labelledby="site-nav-heading">
			<VisuallyHidden as="h2" id="site-nav-heading">
				Site navigation
			</VisuallyHidden>
			{/* nav links */}
		</nav>
	);
}
```

## Accessibility

`VisuallyHidden` applies Tailwind's `sr-only` utility class, which descends from the Bootstrap `.sr-only` technique. The CSS positions the element absolutely, collapses it to a 1×1 pixel box, clips overflow, and sets `white-space: nowrap` — enough to pull it out of the visual flow while leaving it fully present in the DOM and the accessibility tree.

`display: none` and `visibility: hidden` both remove content from the accessibility tree, so screen readers skip it. Plain in-flow text does the opposite and appears on screen. The clip technique sits between: the content participates in the DOM, receives focus if focusable, can be announced by screen readers, and surfaces on refreshable braille displays, but takes up no meaningful visual space.

When the hidden content is focusable (a skip link, for example), it becomes visible on focus. The `sr-only` class does not suppress focus rings, so keyboard users navigating by Tab will see it. Suppressing focus visibility is a separate concern from `VisuallyHidden`.

## Variants and slots

No CVA variant axes. No compound slots; the component is rendered as a single element.

## Related

- [SkipLink](../SkipLink/SkipLink.usage.md) — the companion a11y primitive; SkipLink uses the same `sr-only` technique but is specifically designed to reveal on focus and jump keyboard users to a landmark.
- [Tooltip](../Tooltip/Tooltip.usage.md) — use Tooltip when the accessible label should appear visually on hover or focus rather than staying permanently hidden.
