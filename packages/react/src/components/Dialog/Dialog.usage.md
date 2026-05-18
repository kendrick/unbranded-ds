# Dialog

A modal overlay that traps focus and requires the user to act before returning to the underlying page.

## When to use

Reach for Dialog when the user must confirm an action, fill out a short form, or acknowledge information before continuing — and when leaving the current context entirely would lose state or feel disruptive. Distinguish it from a Tooltip, which is purely informational and requires no user action, and from an inline disclosure like an accordion or details element, which reveals content on the same page without an overlay or focus trap.

## Import

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@unbranded-ds/react';
```

## Props

### Dialog

The root component. It manages open state and passes it to all child slots through context.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | — | Controls open state when you need to manage it externally (controlled mode). Pair with `onOpenChange`. |
| `defaultOpen` | `boolean` | `false` | Seeds the open state for uncontrolled usage. Ignored once `open` is set. |
| `modal` | `boolean \| 'trap-focus'` | `true` | `true` traps focus, locks page scroll, and blocks pointer events outside the dialog. `false` leaves all three open. `'trap-focus'` traps focus only, which suits slide-out panels that coexist with the rest of the page. |
| `onOpenChange` | `(open: boolean, eventDetails: ChangeEventDetails) => void` | — | Fires when the dialog opens or closes. `eventDetails.reason` tells you what triggered the change (`'escapeKey'`, `'outsidePress'`, `'closePress'`, etc.). |
| `onOpenChangeComplete` | `(open: boolean) => void` | — | Fires after all close/open animations finish. Use this to unmount heavy content only after the exit animation completes. |
| `disablePointerDismissal` | `boolean` | `false` | When `true`, clicking outside the dialog does not close it. Reach for this in destructive confirmation flows where accidental dismissal could confuse users. |
| `actionsRef` | `React.RefObject<DialogRoot.Actions>` | — | Imperative handle. Exposes `close()` and `unmount()` for situations where you need to close the dialog programmatically from outside the tree. |
| `handle` | `DialogHandle` | — | Associates the root with an external trigger via `Dialog.createHandle()`. Useful when the trigger lives outside the Dialog's React subtree. |
| `triggerId` | `string \| null` | — | In controlled mode, identifies which trigger is currently active. Maps to a `DialogTrigger`'s `id` prop. |
| `defaultTriggerId` | `string \| null` | — | Same as `triggerId` but for uncontrolled, initially-open dialogs. |
| `children` | `React.ReactNode` | — | The dialog tree. Accepts a render function `(payload) => React.ReactNode` when using the `handle`/`payload` pattern. |

### DialogTrigger

The element that opens the dialog on click. Renders a `<button>` by default; pass `render` to swap the element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `render` | `React.ReactElement` | — | Replaces the rendered element. Pass an existing component (e.g., `render={<Button />}`) to forward all trigger behavior without an extra DOM wrapper. |
| `handle` | `DialogHandle` | — | Links this trigger to a specific Dialog root when they aren't in the same subtree. |
| `payload` | `unknown` | — | Data passed through to the dialog's children render function when this trigger opens the dialog. |
| `id` | `string` | — | Identifies this trigger. The Dialog root uses this via `triggerId` in controlled mode to know which trigger is active. |
| `disabled` | `boolean` | — | Prevents the trigger from opening the dialog and announces it as disabled to assistive technology. |
| `className` | `string` | — | Applied to the trigger element. |

### DialogContent

Renders the dialog panel inside a portal with the overlay behind it. This is the most-composed slot; it accepts all `<div>` props plus two component-specific ones.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `showCloseButton` | `boolean` | `true` | When `true`, renders an `XIcon` close button in the top-right corner of the panel. Set to `false` when your DialogFooter already provides a close action and you want a cleaner header. |
| `initialFocus` | `boolean \| React.RefObject<HTMLElement \| null> \| ((openType: InteractionType) => boolean \| HTMLElement \| null \| void)` | — | Controls which element receives focus when the dialog opens. Pass a `RefObject` to focus a specific input, or a function to vary behavior by interaction type (`'mouse'`, `'keyboard'`, etc.). `false` suppresses focus movement entirely. |
| `finalFocus` | `boolean \| React.RefObject<HTMLElement \| null> \| ((closeType: InteractionType) => boolean \| HTMLElement \| null \| void)` | — | Controls which element receives focus when the dialog closes. Defaults to the trigger. Override when the trigger is no longer in the DOM after the dialog closes. |
| `className` | `string` | — | Merged with the panel's default classes via `cn()`. Use to adjust max-width, padding, or background on a per-dialog basis. |
| `children` | `React.ReactNode` | — | The panel contents. Compose with `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`. |

### DialogHeader

A layout wrapper that stacks its children vertically with a small gap. Renders a `<div>`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Merged with the default flex-column layout classes. |
| `children` | `React.ReactNode` | — | Typically `DialogTitle` and `DialogDescription`. |

### DialogTitle

The dialog's accessible heading. Renders an `<h2>` and is automatically wired to the dialog popup via `aria-labelledby`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Merged with the title's typography classes. |
| `children` | `React.ReactNode` | — | The title text. Keep it concise — screen readers announce this first when the dialog opens. |

### DialogDescription

Supporting text beneath the title. Renders a `<p>` and is wired to the dialog popup via `aria-describedby`. Anchor tags inside it receive underline styling automatically.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `className` | `string` | — | Merged with the muted-foreground typography classes. |
| `children` | `React.ReactNode` | — | Explanatory prose or a brief instruction. Omit when the title alone is self-explanatory; the `aria-describedby` wiring is only applied when this component is rendered. |

### DialogFooter

A layout wrapper for action buttons. Stacks buttons vertically on mobile and arranges them in a row end-aligned on larger viewports. Can optionally render its own close button.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `showCloseButton` | `boolean` | `false` | When `true`, appends an outline-styled "Close" `DialogClose` button at the end of the footer's action row. Useful when `DialogContent`'s top-right close button is hidden (`showCloseButton={false}`) and you want a named close action in the footer instead. |
| `className` | `string` | — | Merged with the flex layout classes. |
| `children` | `React.ReactNode` | — | The action buttons. Standard pattern is a cancel `DialogClose` followed by the primary action. |

### DialogClose

A button that closes the dialog when clicked. Renders a `<button>` by default; pass `render` to swap the element.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `render` | `React.ReactElement` | — | Replaces the rendered element. Pass `render={<Button variant="outline" />}` to style it as a secondary button without breaking the close wiring. |
| `disabled` | `boolean` | — | Prevents the close action and announces the button as disabled. |
| `className` | `string` | — | Applied to the close element. |
| `children` | `React.ReactNode` | — | The button label. Typically "Cancel" or "Close". |

### DialogPortal

Inherits all props from Base UI's `Dialog.Portal`. Reach for this only when you need to override the default mount point (the `container` prop) or control `keepMounted` behavior independently of `DialogContent`.

### DialogOverlay

Inherits all props from Base UI's `Dialog.Backdrop`. Reach for this only when you need to override the default backdrop styling beyond what `className` on `DialogContent` covers.

## Common patterns

### Simple confirmation dialog

The default layout: a title, a description, a cancel action, and a confirm action. The X button in the top-right corner comes from `DialogContent` automatically.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@unbranded-ds/react';
import { Button } from '@unbranded-ds/react';

export function ConfirmationDialog() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save changes</DialogTitle>
          <DialogDescription>
            Your edits will be saved and published immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Destructive confirmation

Pair `Button variant="destructive"` with `disablePointerDismissal` so clicking outside the overlay can't accidentally skip the confirmation.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@unbranded-ds/react';
import { Button } from '@unbranded-ds/react';

export function DeleteDialog() {
  return (
    <Dialog disablePointerDismissal>
      <DialogTrigger render={<Button variant="destructive" />}>
        Delete account
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This action cannot be undone. All your data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button variant="destructive">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Form dialog

Place form fields between `DialogHeader` and `DialogFooter`. The `initialFocus` prop on `DialogContent` moves focus straight to the first input when the dialog opens.

```tsx
import * as React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@unbranded-ds/react';
import { Button } from '@unbranded-ds/react';
import { Input } from '@unbranded-ds/react';
import { Label } from '@unbranded-ds/react';

export function EditProfileDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null);

  return (
    <Dialog>
      <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
      <DialogContent initialFocus={nameRef}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Changes take effect immediately after saving.
          </DialogDescription>
        </DialogHeader>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label htmlFor="name">Name</Label>
            <Input id="name" ref={nameRef} defaultValue="Jane Smith" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="jane@example.com" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### Controlled open state

When external logic drives the dialog (a keyboard shortcut, a route change, a server response), manage `open` yourself.

```tsx
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@unbranded-ds/react';
import { Button } from '@unbranded-ds/react';

export function ControlledDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open externally</Button>
      <Dialog open={open} onOpenChange={(next) => setOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Controlled dialog</DialogTitle>
            <DialogDescription>
              State lives outside the Dialog tree.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Accessibility

When the dialog opens, focus moves inside the panel. By default it lands on the first tabbable element; use `initialFocus` on `DialogContent` to target a specific element (useful in form dialogs where you want focus on the first input rather than the close button).

The focus trap keeps Tab and Shift+Tab cycling within the dialog while it is open. Nothing outside the panel is reachable by keyboard until the dialog closes.

Pressing Escape closes the dialog and returns focus to the trigger that opened it. Clicking outside the overlay also closes the dialog unless `disablePointerDismissal` is set. On close, focus returns to the trigger by default; use `finalFocus` on `DialogContent` to redirect to a different element when the trigger is gone.

Page scroll on `<body>` is locked while the dialog is open (when `modal={true}`, the default). This prevents the page from scrolling behind the overlay, which can disorient screen-magnification users.

The popup carries `role="dialog"` and `aria-modal="true"`. It is associated with `DialogTitle` via `aria-labelledby` and with `DialogDescription` via `aria-describedby` when both are rendered. Screen readers announce the title immediately when focus enters the dialog, and the description follows. Always render `DialogTitle` — skipping it leaves the dialog without an accessible name and will fail automated a11y checks.

When the component has open/close transitions, set `prefers-reduced-motion: reduce` in your test environment or disable animations via `duration-0` to avoid flaky timing-sensitive tests.

## Variants and slots

Dialog has no CVA variant axes. Visual variation comes from the `variant` prop on the `Button` components you compose inside it, not from the dialog shell itself.

### Slots

- `Dialog` — root state manager; no rendered element.
- `DialogTrigger` — the element that opens the dialog.
- `DialogContent` — the floating panel; also renders the portal and overlay internally.
- `DialogHeader` — vertical layout wrapper for title and description.
- `DialogTitle` — the accessible heading; wired to the panel via `aria-labelledby`.
- `DialogDescription` — supporting text; wired to the panel via `aria-describedby`.
- `DialogFooter` — horizontal layout wrapper for action buttons.
- `DialogClose` — a button that closes the dialog when clicked.
- `DialogPortal` — escape hatch: the portal that mounts the panel outside the DOM tree.
- `DialogOverlay` — escape hatch: the backdrop rendered behind the panel.

## Related

- [Button](../Button/Button.usage.md) — the standard trigger and confirm/cancel affordances inside Dialog.
- [Tooltip](../Tooltip/Tooltip.usage.md) — use Tooltip instead when the content is purely informational and requires no user action.
- [Card](../Card/Card.usage.md) — use Card for non-modal grouping when focus trapping and scroll lock are not needed.
- [Input](../Input/Input.usage.md) — Dialog is the natural host for short single-purpose forms that collect one or two Input values.
