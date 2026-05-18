# Switch

An immediate-action toggle that wraps Base UI's Switch primitive with design-token styling.

## When to use

Use Switch when flipping a setting takes effect right now — no form submit, no confirmation step. The mental model is a physical on/off switch: the change is visible the moment the user acts. Reach for Checkbox instead when the control is part of a submitted form, when the user is selecting from a list of options, or when the outcome won't apply until they hit a Save button. The distinction is immediacy, not appearance.

## Import

```tsx
import { Switch } from '@unbranded-ds/react';
```

## Props

| Prop               | Type                                                                         | Default     | Description                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `size`             | `'sm' \| 'default'`                                                          | `'default'` | Controls the physical dimensions of the track and thumb. Use `'sm'` in dense layouts like settings rows inside a sidebar.                   |
| `checked`          | `boolean`                                                                    | —           | Controlled on/off state. Pair with `onCheckedChange` when the parent owns the value.                                                        |
| `defaultChecked`   | `boolean`                                                                    | `false`     | Uncontrolled initial state. Use this when you don't need the value in React state.                                                          |
| `disabled`         | `boolean`                                                                    | `false`     | Prevents interaction and reduces opacity. The element stays in the DOM and its value is not submitted.                                      |
| `readOnly`         | `boolean`                                                                    | `false`     | Displays the current state without allowing changes. The switch remains focusable and in the tab order.                                     |
| `required`         | `boolean`                                                                    | `false`     | Marks the hidden input as required for native form validation.                                                                              |
| `name`             | `string`                                                                     | —           | The field name submitted with a form.                                                                                                       |
| `uncheckedValue`   | `string`                                                                     | —           | The value submitted when the switch is off. By default, an unchecked switch submits nothing, matching native checkbox behavior.             |
| `onCheckedChange`  | `(checked: boolean, eventDetails: SwitchRoot.ChangeEventDetails) => void`   | —           | Fires when the user toggles the switch. Receives the new boolean state and event details.                                                   |
| `inputRef`         | `React.Ref<HTMLInputElement>`                                                | —           | Ref to the hidden `<input>` element. Useful when integrating with uncontrolled form libraries that read the underlying input directly.      |
| `className`        | `string`                                                                     | —           | Merged with variant classes via `cn()`. Pass additional Tailwind classes here when you need to adjust layout or override a token.           |

## Common patterns

### Paired with a label

The Switch does not render its own label text. Wire a `<Label>` via matching `id` and `htmlFor` so clicking the label text also toggles the switch.

```tsx
import { Switch } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function AirplaneMode() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Airplane mode</Label>
    </div>
  );
}
```

### Controlled toggle

When a parent component needs to react to the switch state — enabling a section, triggering a save — use `checked` and `onCheckedChange` together.

```tsx
import { useState } from 'react';
import { Switch } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function NotificationsToggle() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Switch
        id="notifications"
        checked={enabled}
        onCheckedChange={(checked) => setEnabled(checked)}
      />
      <Label htmlFor="notifications">Push notifications</Label>
    </div>
  );
}
```

### Small size in a dense settings list

Use `size="sm"` when the switch sits inside a compact layout like a sidebar or a table row where the default track height reads as too heavy.

```tsx
import { Switch } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function CompactSetting() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Switch id="compact-wifi" size="sm" defaultChecked />
      <Label htmlFor="compact-wifi">Wi-Fi</Label>
    </div>
  );
}
```

### Disabled state

Pass `disabled` to lock the current state. The track and thumb render at reduced opacity. No extra CSS is needed — the `data-disabled` attribute applied by Base UI triggers the opacity rule in the component's class list.

```tsx
import { Switch } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function UnavailableSetting() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Switch id="enterprise-feature" disabled defaultChecked />
      <Label htmlFor="enterprise-feature">Advanced audit log (Enterprise only)</Label>
    </div>
  );
}
```

## Accessibility

Switch renders a `<span>` with `role="switch"` and a hidden `<input>` beside it. Assistive technology reads the binary state via `aria-checked`: `true` when on, `false` when off. Unlike a checkbox, a switch has no mixed/indeterminate state.

The component is reachable via Tab. Space toggles the current state. A visible focus ring appears on `:focus-visible` so keyboard users get a clear indicator without pointer clicks picking up the ring.

`aria-invalid` styling activates automatically when the underlying input is marked invalid — the border and ring shift to destructive red. Pair every Switch with a `<Label>`, `aria-label`, or `aria-labelledby` so screen readers can announce what setting the switch controls; the component does not inject label text on its own.

## Variants and slots

Switch has one CVA-style variant: `size`, with values `'sm'` and `'default'` (default: `'default'`). The size is applied via a `data-size` attribute on the root and drives track and thumb dimensions through Tailwind data-attribute selectors rather than a CVA call — the effect is the same as a CVA axis.

Two internal slots are rendered but not exported for composition:

- `data-slot="switch"` — the root track element.
- `data-slot="switch-thumb"` — the sliding indicator inside the track.

## Related

- [Checkbox](../Checkbox/Checkbox.usage.md) — use Checkbox when the toggle is part of a submitted form or a list of selectable options rather than an immediate setting.
- [Label](../Label/Label.usage.md) — always pair a Label with Switch so the click target extends to the text and screen readers can announce what the switch controls.
