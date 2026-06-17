---
"@unbranded-ds/react": patch
---

Fix the accessible-name guidance for the ARIA-role form controls, and warn in development when one renders unnamed.

Checkbox, Switch, and Slider render a `role="checkbox"`/`"switch"`/`"slider"` element, which a native `<label>` does not name — only `aria-label` or `aria-labelledby` does. The docs taught the native-label pattern, so a developer who copied an example shipped an unnamed control. The `@example` blocks and usage sidecars now show the working pattern: `aria-label` for an unlabeled control, or a visible `<Label id>` paired with `aria-labelledby` for a labeled one. The wrapping `<label>` (Checkbox) and `htmlFor` association (Switch) stay for click-to-toggle.

A development-only warning now fires when one of these controls mounts with neither `aria-label` nor `aria-labelledby`, naming the control and the fix. It reads props only, never the DOM, and production builds strip it. Neither the warning nor the doc fixes change any rendered DOM.
