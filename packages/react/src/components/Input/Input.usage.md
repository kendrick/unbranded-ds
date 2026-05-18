# Input

A single-line text field that accepts keyboard input from the user.

## When to use

Reach for Input any time you need to collect a short, unformatted string from the user: search queries, email addresses, passwords, numeric values. For longer freeform text, use a `<textarea>`. For selecting from a fixed set of choices, use Select or a radio group instead.

## Import

```tsx
import { Input } from '@unbranded-ds/react';
```

## Props

Input spreads all props from `React.ComponentProps<'input'>` onto the underlying element, so every valid HTML input attribute is accepted. The named props in the signature are:

| Prop        | Type     | Default | Description                                                                                                           |
| ----------- | -------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| `type`      | `string` | —       | The HTML input type (`"text"`, `"email"`, `"password"`, `"file"`, etc.). Passed directly to the underlying element.  |
| `className` | `string` | —       | Merged with the default classes via `cn()`. Use this to override width or add one-off layout adjustments.            |

All other props — `id`, `name`, `value`, `defaultValue`, `onChange`, `disabled`, `required`, `aria-*`, `data-*`, and the rest — pass through to the underlying `<input>`.

## Common patterns

### Paired with a label

Always associate a label with the input so assistive technology can announce the field's purpose. The `htmlFor`/`id` pairing is the most straightforward way to do this.

```tsx
import { Input } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function EmailField() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<Label htmlFor="email">Email</Label>
			<Input id="email" type="email" placeholder="you@example.com" />
		</div>
	);
}
```

### Disabled state

Pass `disabled` when the field is not currently editable. The input's pointer events are removed and its opacity drops to visually signal the state.

```tsx
import { Input } from '@unbranded-ds/react';

export function DisabledField() {
	return <Input disabled placeholder="Not editable right now" />;
}
```

### Validation error state

Set `aria-invalid="true"` on the input to trigger the destructive-colored border and ring. This attribute is the contract between your form validation logic and the input's visual error state.

```tsx
import { Input } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function ErrorField() {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<Label htmlFor="username">Username</Label>
			<Input id="username" aria-invalid="true" defaultValue="taken@handle" />
		</div>
	);
}
```

### File upload

Pass `type="file"` to get a file picker. The input applies consistent inline styling to the browser's native file button.

```tsx
import { Input } from '@unbranded-ds/react';

export function FileField() {
	return <Input type="file" />;
}
```

## Accessibility

Input renders a native `<input>` element through Base UI's input primitive, so it carries native keyboard and screen-reader semantics without additional ARIA work.

Tab moves focus to the field. Once focused, the user types freely. On form submission, browsers surface validation errors for `required`, `type`, and `pattern` constraints natively.

When `aria-invalid="true"` is present, screen readers announce the field as invalid when it receives focus. Pair this with a visible error message linked via `aria-describedby` so the error text is discoverable both visually and programmatically.

When `disabled` is set, the field is removed from the tab order and announced as disabled to assistive technology.

The component applies a visible focus ring (`focus-visible:ring-3`) that respects the design system's ring token. This ring is suppressed on mouse/touch focus via the `:focus-visible` selector, so keyboard users get the indicator without it appearing on click.

The component has no explicit `prefers-reduced-motion` handling because its transition is limited to color and box-shadow — properties that do not cause motion discomfort. The transition is safe to leave active.

## Variants and slots

Input has no CVA variant axes. Its visual states (default, focus, error, disabled, dark mode) are all handled by Tailwind utility classes baked into the component's class string, not by CVA.

The component renders as a single element with `data-slot="input"`. No compound slots.

## Related

- [Label](../Label/Label.usage.md) — always pair an Input with a Label so assistive technology can announce the field's purpose.
- [Select](../Select/Select.usage.md) — use Select when the valid values are a fixed list rather than free-form text.
- [Checkbox](../Checkbox/Checkbox.usage.md) — use Checkbox or Switch when the field value is boolean rather than a string or number.
- [Switch](../Switch/Switch.usage.md) — use Switch for immediate boolean toggles; Input handles typed values that apply on submit.
