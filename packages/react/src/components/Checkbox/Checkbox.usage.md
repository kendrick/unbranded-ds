# Checkbox

A token-styled boolean input that wraps Base UI's Checkbox primitive.

## When to use

Reach for Checkbox when a user needs to opt into or out of a single option independently — a newsletter subscription, a terms acceptance, a filter toggle. When multiple checkboxes share a parent state that can be partially selected, pass `indeterminate` to the parent to communicate the mixed state. For mutually exclusive choices, use a radio group instead.

## Import

```tsx
import { Checkbox } from '@unbranded-ds/react';
```

## Props

| Prop              | Type                                                                 | Default     | Description                                                                                                                                           |
| ----------------- | -------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `checked`         | `boolean`                                                            | —           | Controlled checked state. Pair with `onCheckedChange` to own the value yourself.                                                                      |
| `defaultChecked`  | `boolean`                                                            | `false`     | Uncontrolled initial state. Use this when you don't need to track the value in React state.                                                           |
| `disabled`        | `boolean`                                                            | `false`     | Prevents interaction and reduces opacity. When a field is disabled inside a `group-has-disabled/field` context, the opacity rule fires automatically. |
| `indeterminate`   | `boolean`                                                            | `false`     | Puts the checkbox in a mixed state — neither checked nor unchecked. Use for a "select all" parent whose children are partially selected.              |
| `readOnly`        | `boolean`                                                            | `false`     | Displays the current value without allowing changes. The checkbox stays in the tab order and can receive focus.                                       |
| `required`        | `boolean`                                                            | `false`     | Marks the hidden input required for native form validation.                                                                                           |
| `name`            | `string`                                                             | —           | The field name submitted with a form.                                                                                                                 |
| `value`           | `string`                                                             | —           | The value submitted when the checkbox is checked.                                                                                                     |
| `onCheckedChange` | `(checked: boolean, eventDetails: CheckboxRootChangeEventDetails) => void` | —    | Fires when the user toggles the checkbox. Receives the new boolean state and event details.                                                           |
| `inputRef`        | `React.Ref<HTMLInputElement>`                                        | —           | Ref to the hidden `<input>` element, useful when integrating with uncontrolled form libraries.                                                        |
| `className`       | `string`                                                             | —           | Merged with variant classes via `cn()`. Override-friendly.                                                                                            |

## Common patterns

### Standalone uncontrolled

The simplest case: an uncontrolled checkbox with a visible label. Wrap both in a `<label>` so clicking the text toggles the checkbox without extra wiring.

```tsx
import { Checkbox } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function AcceptTerms() {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Checkbox defaultChecked={false} name="terms" />
      <Label>Accept terms and conditions</Label>
    </label>
  );
}
```

### Controlled checkbox

When parent state needs to track the value — for example, to gate a submit button — use `checked` and `onCheckedChange` together.

```tsx
import { useState } from 'react';
import { Checkbox } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function SubscribeToggle() {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Checkbox
        checked={subscribed}
        onCheckedChange={(checked) => setSubscribed(checked)}
        name="subscribe"
      />
      <Label>Subscribe to updates</Label>
    </label>
  );
}
```

### Indeterminate parent

When a "select all" checkbox should reflect a partially selected list, drive `checked` and `indeterminate` from the child states. The indeterminate visual is distinct from both checked and unchecked.

```tsx
import { useState } from 'react';
import { Checkbox } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function SelectAll() {
  const [items, setItems] = useState([false, false, true]);
  const allChecked = items.every(Boolean);
  const someChecked = items.some(Boolean);

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox
          checked={allChecked}
          indeterminate={someChecked && !allChecked}
          onCheckedChange={(checked) => setItems(items.map(() => checked))}
        />
        <Label>Select all</Label>
      </label>
    </div>
  );
}
```

### Disabled state

Pass `disabled` to prevent interaction. The component reduces opacity automatically. When the checkbox is inside a field group marked with the `group/field` utility class and that group is disabled, the opacity rule fires via the `group-has-disabled/field:opacity-50` selector in the component's class list — no extra work needed.

```tsx
import { Checkbox } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function DisabledOption() {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Checkbox disabled defaultChecked />
      <Label>Notifications (unavailable on this plan)</Label>
    </label>
  );
}
```

## Accessibility

Checkbox renders a `<span>` with `role="checkbox"` and a hidden `<input>` beside it. Assistive technology reads the checked, unchecked, or mixed state via `aria-checked`. When `indeterminate` is true, `aria-checked` is set to `"mixed"`.

The component is focusable with Tab. Space toggles the checked state. The focus ring appears on `:focus-visible` — keyboard focus gets a visible ring; pointer clicks do not.

`aria-invalid` styling activates when the underlying input is marked invalid, turning the border and ring destructive red. This integrates with field-level validation patterns without additional ARIA attributes on the consumer side.

Pair every standalone checkbox with a `<label>` (or `aria-label`/`aria-labelledby`) so screen readers can announce what the checkbox controls. The component itself does not inject a label.

## Variants and slots

Checkbox has no CVA variant axes. Checked, disabled, indeterminate, and invalid states are driven by data attributes (`data-checked`, `data-disabled`) and ARIA attributes (`aria-invalid`) applied by the Base UI primitive, with corresponding Tailwind selectors in the class list.

Two internal slots are rendered but not exported for direct composition:

- `data-slot="checkbox"` — the root `<span>` element.
- `data-slot="checkbox-indicator"` — the icon container, visible only when checked or indeterminate.
