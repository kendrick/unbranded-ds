# Select

A dropdown input that lets users pick one value from a scrollable list of options.

## When to use

Use Select when the list of options is long enough that showing them all inline would clutter the interface, and when exactly one choice is needed at a time. Prefer a SegmentedControl when the option set is small and you want all choices visible at once — the persistent visibility helps users compare options without opening anything. Prefer a native `<select>` only when you need built-in form submission behavior without any custom styling. Select gives you full token-based styling and keyboard behavior that a native element cannot match.

## Import

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@unbranded-ds/react';
```

## Props

### Select props

`Select` is a direct alias for the Base UI `SelectRoot`. It owns the open/closed state, the selected value, and the form integration surface.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Value \| null` | — | The controlled selected value. Use with `onValueChange` when you need to own the state. |
| `defaultValue` | `Value \| null` | — | The uncontrolled initial value. Omit if you want to start with nothing selected. |
| `onValueChange` | `(value: Value \| null, event) => void` | — | Fires whenever the selection changes. Receives the new value plus Base UI change event details. |
| `open` | `boolean` | — | Controls the popup open state from outside. Pair with `onOpenChange`. |
| `defaultOpen` | `boolean` | `false` | Opens the popup on first render without owning the state. Useful for demos or auto-open flows. |
| `onOpenChange` | `(open: boolean, event) => void` | — | Fires when the popup opens or closes. |
| `disabled` | `boolean` | `false` | Disables the entire Select, including the trigger and all items. |
| `required` | `boolean` | `false` | Marks the hidden input required for form validation. |
| `name` | `string` | — | The field name for form submission. |
| `multiple` | `boolean` | `false` | Allows selecting more than one item at a time. When `true`, `value` and `onValueChange` operate on arrays. |
| `modal` | `boolean` | `true` | When `true`, locks page scroll and blocks pointer interaction outside the popup while it is open. Set to `false` when the Select lives inside a modal that already handles scroll lock. |

### SelectTrigger props

Renders a `<button>` that opens the popup. Appends a `ChevronDownIcon` automatically — you do not need to add it.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `'sm' \| 'default'` | `'default'` | Controls trigger height. `'sm'` renders at `h-8`; `'default'` at `h-9`. Choose `'sm'` for compact forms or dense toolbars. |
| `disabled` | `boolean` | — | Disables this trigger independently of the root `disabled` prop. Rarely needed — prefer disabling at the `Select` level. |
| `className` | `string` | — | Merged via `cn()` after the built-in trigger classes. |

### SelectValue props

Renders the label of the currently selected item inside the trigger. When nothing is selected, renders its `children` as a placeholder.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode \| ((value) => ReactNode)` | — | Static children act as a placeholder when no value is selected. Pass a render function to format the live selected value (e.g., to prepend a currency symbol). |
| `className` | `string` | — | Merged via `cn()` after the built-in flex classes. |

### SelectContent props

Wraps the floating popup. Accepts positioning props alongside the standard popup props.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'`  | `'bottom'` | Which side of the trigger the popup opens on. The positioner may flip to the opposite side when there is not enough space. |
| `sideOffset` | `number` | `4` | Gap in pixels between the trigger and the popup edge. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Horizontal alignment of the popup relative to the trigger. |
| `alignOffset` | `number` | `0` | Pixel offset applied along the alignment axis. |
| `alignItemWithTrigger` | `boolean` | `true` | When `true`, the popup scrolls so the selected item visually aligns with the trigger's text on open. Automatically disables when there is not enough room or when touch input is detected. |
| `className` | `string` | — | Merged via `cn()` onto the popup element. |

### SelectGroup props

A grouping container for related items. Wrap a `SelectLabel` and one or more `SelectItems` inside it. Inherits all props from `BaseUIComponentProps<'div'>` — `className` and standard div attributes apply.

### SelectLabel props

A non-interactive heading inside a `SelectGroup`. Inherits all props from `BaseUIComponentProps<'div'>`. The label is automatically associated with its parent group for assistive technology.

### SelectItem props

A single selectable option.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `any` | `null` | The value submitted when this item is chosen. Must be unique within the Select. |
| `disabled` | `boolean` | `false` | Marks this item as non-interactive. It remains visible but skipped during keyboard navigation. Use to show unavailable options without removing them. |
| `label` | `string` | — | Text used for keyboard type-ahead matching. Defaults to the item's text content; set this explicitly when the item contains icons or formatted content that would confuse type-ahead. |
| `className` | `string` | — | Merged via `cn()` after the built-in item classes. |

### SelectSeparator props

A horizontal rule between items or groups. Inherits all props from `BaseUIComponentProps<'div'>`. Reach for this only when a visual boundary between groups is needed and `SelectGroup`/`SelectLabel` alone do not provide enough separation in the layout.

### SelectScrollUpButton props

A scroll affordance that appears at the top of the popup when the list overflows upward. Inherits all props from `ComponentProps<typeof SelectPrimitive.ScrollUpArrow>`. The component renders a `ChevronUpIcon` automatically. Reach for this only when you need to override the icon or styles — it is already included inside `SelectContent`.

### SelectScrollDownButton props

A scroll affordance that appears at the bottom of the popup when the list overflows downward. Mirrors `SelectScrollUpButton` in every respect. Already included inside `SelectContent`.

## Common patterns

### Simple uncontrolled select

The most common usage: an uncontrolled select with a placeholder. Base UI stores the selection internally.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@unbranded-ds/react';

export function FruitPicker() {
  return (
    <Select>
      <SelectTrigger style={{ width: '200px' }}>
        <SelectValue>Select a fruit</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Controlled select

Own the value in your component when you need to react to changes — for instance, to update a sibling field or submit the value via a form library.

```tsx
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@unbranded-ds/react';

export function ControlledFruitPicker() {
  const [fruit, setFruit] = useState<string | null>(null);

  return (
    <Select value={fruit} onValueChange={(v) => setFruit(v)}>
      <SelectTrigger style={{ width: '200px' }}>
        <SelectValue>{fruit ?? 'Select a fruit'}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="cherry">Cherry</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

### Grouped options

Wrap related items in `SelectGroup` with a `SelectLabel` when the option list spans multiple categories. Each group gets its own accessible label.

```tsx
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@unbranded-ds/react';

export function FoodPicker() {
  return (
    <Select>
      <SelectTrigger style={{ width: '200px' }}>
        <SelectValue>Select a food</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="lettuce">Lettuce</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
```

### Disabled select

Pass `disabled` to the root `Select` when the field is temporarily unavailable. The trigger and all items become inert.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@unbranded-ds/react';

export function DisabledSelect() {
  return (
    <Select disabled>
      <SelectTrigger style={{ width: '200px' }}>
        <SelectValue>Unavailable</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Option A</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

## Accessibility

Select builds on Base UI's Select primitive, which implements the ARIA listbox pattern. The trigger has `role="combobox"` and `aria-haspopup="listbox"`. When the popup opens, it carries `role="listbox"` and the selected item has `aria-selected="true"`.

Keyboard behavior when the trigger is focused: pressing `Enter`, `Space`, or `ArrowDown` opens the popup. Once open, `ArrowDown` and `ArrowUp` move the highlighted item down and up; `Home` jumps to the first item; `End` jumps to the last. Pressing `Enter` or `Space` selects the highlighted item and closes the popup. `Escape` closes the popup without changing the selection and returns focus to the trigger.

Type-ahead is active while the popup is open — typing a character moves focus to the first item whose label starts with that character. Multi-character sequences narrow the match further if typed quickly. When a `SelectItem` contains non-text content (icons, badges), set the `label` prop explicitly so type-ahead has the right string to match against.

The `SelectValue` inside the trigger announces the currently selected label to screen readers on change, so users do not need to re-open the list to confirm their choice.

When `modal` is `true` (the default), opening the Select locks document scroll and traps pointer interaction within the popup — matching the behavior expected of a modal-style overlay. Set `modal={false}` when the Select is already inside a Dialog or Sheet that handles scroll lock, to avoid stacking two scroll locks.

The component respects `prefers-reduced-motion: reduce`. The popup open and close transitions (fade and zoom) are skipped when the user has that preference set.

## Variants and slots

`SelectTrigger` has one CVA-adjacent size axis (`size`), applied via a `data-size` attribute rather than CVA directly:

- `size`: `default` (h-9), `sm` (h-8)

All other visual differences are driven by state-based data attributes (`data-placeholder`, `aria-invalid`, `aria-disabled`) rather than explicit variant props.

### Slots

- `Select` — root state owner; no rendered element
- `SelectTrigger` — the button that opens the popup; carries the `select-trigger` data-slot
- `SelectValue` — text display of the current selection inside the trigger; carries `select-value`
- `SelectContent` — the floating popup container; composes Positioner and Popup internally; carries `select-content`
- `SelectGroup` — groups related items with a shared label; carries `select-group`
- `SelectLabel` — non-interactive category heading inside a group; carries `select-label`
- `SelectItem` — a single selectable option; carries `select-item`
- `SelectSeparator` — a horizontal rule for visual separation between items or groups; carries `select-separator`
- `SelectScrollUpButton` — scroll-up affordance at the top of an overflowing list; carries `select-scroll-up-button`
- `SelectScrollDownButton` — scroll-down affordance at the bottom of an overflowing list; carries `select-scroll-down-button`
