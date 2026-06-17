# Label

A thin semantic wrapper around `<label>` that applies design-token typography and disabled-state styling.

## When to use

Reach for Label whenever a form field needs a visible text association. The component handles two wiring patterns: pass `htmlFor` pointing at an input's `id`, or nest the input directly as a child so the browser infers the association automatically. Because Label renders a native `<label>`, clicking the label text moves focus to the paired control — no JavaScript required.

## Import

```tsx
import { Label } from '@unbranded-ds/react';
```

## Props

| Prop        | Type              | Default | Description                                                                                                                                          |
| ----------- | ----------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `htmlFor`   | `string`          | —       | ID of the form control this label describes. Use when the input and label are siblings in the DOM rather than nested. Omit when nesting the control. |
| `className` | `string`          | —       | Merged with base classes via `cn()`. Use for one-off layout overrides without forking the component.                                                 |
| `children`  | `React.ReactNode` | —       | Label text and any inline decorations (required markers, icons). The click target extends to everything rendered here.                               |

All other props (`id`, `style`, `data-*`, `aria-*`, etc.) forward directly to the underlying `<label>` element.

## Common patterns

### Linked label and input

Pass `htmlFor` matching the input's `id` when the two elements are siblings. This is the most common pattern in column-layout forms.

```tsx
import { Input, Label } from '@unbranded-ds/react';

export function LinkedField() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<Label htmlFor="email">Email address</Label>
			<Input id="email" type="email" placeholder="you@example.com" />
		</div>
	);
}
```

### Wrapping label

Nesting the input inside Label lets the browser infer the association without `htmlFor`/`id`. Useful when generating unique IDs would be awkward.

```tsx
import { Input, Label } from '@unbranded-ds/react';

export function WrappingField() {
	return (
		<Label>
			Username
			<Input placeholder="handle" />
		</Label>
	);
}
```

### Required field marker

Append a visual asterisk inside the label text. Screen readers that read the full label text will announce it, so keep the marker's meaning clear from surrounding form context or an explicit legend.

```tsx
import { Input, Label } from '@unbranded-ds/react';

export function RequiredField() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<Label htmlFor="required-name">
				Full name
				{' '}
				<span style={{ color: 'var(--color-destructive)' }}>*</span>
			</Label>
			<Input id="required-name" required />
		</div>
	);
}
```

### Disabled state via group

When a fieldset or container controls the disabled state, add `data-disabled="true"` to the wrapping element. Label reads the `group-data-[disabled=true]` class and dims itself to match the disabled input — no per-element prop needed.

```tsx
import { Input, Label } from '@unbranded-ds/react';

export function DisabledField() {
	return (
		<div className="group" data-disabled="true" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<Label htmlFor="disabled-field">Account number</Label>
			<Input id="disabled-field" disabled />
		</div>
	);
}
```

## Accessibility

Label renders a native `<label>` element. Browsers and assistive technology compute the accessible name for the associated control from the label's text content, so no extra `aria-label` or `aria-labelledby` is needed on the input when a Label is properly associated.

Two association patterns work: `htmlFor` on Label pointing to the control's `id`, or nesting the control as a direct child of Label. Both satisfy WCAG 1.3.1 and 2.4.6. Clicking anywhere within the rendered label — including inline decorations like required markers — moves keyboard focus to the paired input. For inputs that are disabled, the `peer-disabled` Tailwind classes on Label apply `cursor-not-allowed` and `opacity-50` automatically when the input is a CSS peer.

Avoid wrapping non-form content in Label to get the click-to-focus behavior. The browser may report accessibility violations if a `<label>` is associated with a non-labelable element.

## Variants and slots

No CVA variant axes. No compound slots; the component is rendered as a single element.

## Related

- [Input](../Input/Input.usage.md) — the canonical pairing; associate a Label with every Input via `htmlFor`/`id` or nesting.
- [Switch](../Switch/Switch.usage.md) — pair a Label with Switch so clicking the label text also toggles the control.
- [Checkbox](../Checkbox/Checkbox.usage.md) — pair a Label with Checkbox to extend the click target and supply the accessible name.
- [Select](../Select/Select.usage.md) — Label works the same way with Select as with any other labeled control.
