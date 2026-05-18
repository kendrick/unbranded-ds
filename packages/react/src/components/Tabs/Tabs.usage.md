# Tabs

A compound component that organizes content into labeled panels, showing one at a time.

## When to use

Use Tabs when you have multiple distinct content sections that share the same screen region and the user switches between them without leaving the page. Tabs differ from Dialog in that they carry no modal context and impose no focus trap — the rest of the page stays fully accessible while a panel is visible. They differ from SegmentedControl in that each tab governs a panel of content; SegmentedControl selects a value but renders no associated panel. They differ from conditionally rendered Card sections or inline disclosure patterns in that Tabs provide proper ARIA tab semantics (`role="tablist"`, `role="tab"`, `role="tabpanel"`) and keyboard navigation that those patterns lack by default.

## Import

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@unbranded-ds/react';
```

## Props

### Tabs

The root component. Manages the active tab value and passes orientation through context to all child slots.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `any \| null` | — | Controls the active tab in controlled mode. Pair with `onValueChange`. When `null`, no tab is active. |
| `defaultValue` | `any \| null` | `0` | Seeds the active tab for uncontrolled usage. Ignored once `value` is set. |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Sets the layout direction. `'horizontal'` stacks the list above the panels; `'vertical'` places the list beside them. Also governs which arrow keys move focus between tabs. |
| `onValueChange` | `(value: any, eventDetails: TabsRoot.ChangeEventDetails) => void` | — | Fires when the active tab changes. `eventDetails.activationDirection` indicates the direction of movement (`'left'`, `'right'`, `'up'`, `'down'`, or `'none'`). |
| `className` | `string` | — | Merged with the root's flex-layout classes via `cn()`. |
| `children` | `React.ReactNode` | — | The tabs tree. Compose `TabsList` (with `TabsTrigger` children) and the corresponding `TabsContent` panels. |

### TabsList

Groups the tab trigger buttons. Renders a `<div>` with `role="tablist"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'default' \| 'line'` | `'default'` | Visual style of the list container. `'default'` uses a muted pill background; `'line'` uses a transparent background and renders an underline indicator on the active trigger. |
| `activateOnFocus` | `boolean` | `false` | When `true`, moving focus with arrow keys immediately activates the focused tab (automatic activation). When `false`, the user must press Enter or Space to activate (manual activation). |
| `loopFocus` | `boolean` | `true` | When `true`, arrow-key focus wraps from the last tab back to the first (and vice versa). |
| `className` | `string` | — | Merged with the list's layout classes. |
| `children` | `React.ReactNode` | — | The `TabsTrigger` elements. |

### TabsTrigger

An individual tab button. Renders a `<button>` with `role="tab"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `any` | — | **Required.** Identifies which panel this trigger activates. Must match the `value` on the corresponding `TabsContent`. |
| `disabled` | `boolean` | — | Prevents the trigger from being activated and marks it as disabled for assistive technology. |
| `className` | `string` | — | Merged with the trigger's style classes. |
| `children` | `React.ReactNode` | — | The tab label. Can include text, an icon, or both. |

### TabsContent

A panel that is shown when its corresponding trigger is active. Renders a `<div>` with `role="tabpanel"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `any` | — | **Required.** The tab value this panel corresponds to. Must match the `value` on its `TabsTrigger`. |
| `keepMounted` | `boolean` | `false` | When `true`, keeps the panel's DOM node in the tree while it is hidden. Useful when panel content is expensive to remount or carries its own scroll position. |
| `className` | `string` | — | Merged with the panel's default classes. |
| `children` | `React.ReactNode` | — | The panel content. |

## Common patterns

### Uncontrolled tabs

The simplest usage. Pass `defaultValue` matching one of the trigger values and let the component manage state internally.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@unbranded-ds/react';

export function AccountTabs() {
  return (
    <Tabs defaultValue="account">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p>Manage your account settings.</p>
      </TabsContent>
      <TabsContent value="password">
        <p>Change your password here.</p>
      </TabsContent>
    </Tabs>
  );
}
```

### Controlled tabs

When external logic drives the active tab — a URL parameter, a sidebar selection, a notification — manage `value` yourself.

```tsx
import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@unbranded-ds/react';

export function ControlledTabs() {
  const [tab, setTab] = React.useState<string>('account');

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(String(v))}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p>Manage your account settings.</p>
      </TabsContent>
      <TabsContent value="password">
        <p>Change your password here.</p>
      </TabsContent>
    </Tabs>
  );
}
```

### Vertical orientation

Pass `orientation="vertical"` when the tab list should sit beside the panels rather than above them. Arrow-key navigation switches to Up/Down automatically.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@unbranded-ds/react';

export function VerticalTabs() {
  return (
    <Tabs defaultValue="profile" orientation="vertical">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <p>Profile settings.</p>
      </TabsContent>
      <TabsContent value="notifications">
        <p>Notification preferences.</p>
      </TabsContent>
      <TabsContent value="security">
        <p>Security settings.</p>
      </TabsContent>
      <TabsContent value="billing">
        <p>Billing information.</p>
      </TabsContent>
    </Tabs>
  );
}
```

### Line variant

Use `variant="line"` on `TabsList` for a lighter visual treatment that works better on white or image backgrounds where the muted pill would clash.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@unbranded-ds/react';

export function LineTabs() {
  return (
    <Tabs defaultValue="overview">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p>Overview content.</p>
      </TabsContent>
      <TabsContent value="details">
        <p>Detail content.</p>
      </TabsContent>
      <TabsContent value="history">
        <p>History content.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p>Settings content.</p>
      </TabsContent>
    </Tabs>
  );
}
```

## Accessibility

`TabsList` renders with `role="tablist"`. Each `TabsTrigger` carries `role="tab"` and is associated with its panel via `aria-controls`; `TabsContent` carries `role="tabpanel"` and is labelled by its trigger via `aria-labelledby`. This three-part wiring is handled automatically — you only need to keep `value` in sync between triggers and panels.

**Keyboard navigation** follows the ARIA Tabs pattern:

- In a **horizontal** list, Left and Right arrow keys move focus between triggers. In a **vertical** list, Up and Down arrow keys move focus instead.
- Home moves focus to the first trigger; End moves focus to the last.
- When `loopFocus` is `true` (the default), focus wraps at both ends of the list.

**Activation mode** is controlled by `activateOnFocus` on `TabsList`:

- `activateOnFocus={false}` (default) uses **manual activation**: arrow keys move focus without switching panels. The user presses Enter or Space to commit the selection. This mode is preferable when panel content is expensive to render or when switching panels triggers a side effect like a network request.
- `activateOnFocus={true}` uses **automatic activation**: focus and activation move together on arrow key press. Use this when panels are lightweight and the user benefits from instant preview.

Disabled triggers receive `aria-disabled` and are skipped during arrow-key navigation. Tab key moves focus out of the tab list entirely — it does not cycle through triggers.

## Variants and slots

### Slots

`Tabs` carries `data-slot="tabs"` on its root element. The data attribute also reflects the active orientation as `data-orientation="horizontal"` or `data-orientation="vertical"`, which the child slots use for layout decisions via group-data Tailwind selectors.

- `tabs` — the root container (`Tabs`).
- `tabs-list` — the trigger row or column (`TabsList`). Also carries `data-variant` reflecting the active variant, which `TabsTrigger` reads to apply the correct active-state styles.
- `tabs-trigger` — individual tab button (`TabsTrigger`).
- `tabs-content` — content panel (`TabsContent`).

### `tabsListVariants` axes

`tabsListVariants` is a CVA helper exported alongside the components for consumers who need to apply the same list styling to a custom container. It exposes one variant axis:

| Axis | Values | Default |
| --- | --- | --- |
| `variant` | `'default'` \| `'line'` | `'default'` |

`'default'` renders a muted rounded pill background. `'line'` renders a transparent background; the active trigger's underline indicator is provided by the `::after` pseudo-element on `TabsTrigger` via the `group-data-[variant=line]` Tailwind selector.
