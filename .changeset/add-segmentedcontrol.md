---
'@unbranded-ds/react': minor
---

Add `<SegmentedControl>` — a mutually-exclusive selection control built on Base UI's RadioGroup primitives, styled as a connected pill. Keyboard navigation follows the WAI-ARIA radiogroup pattern: horizontal orientation uses Left and Right arrows, vertical uses Up and Down, with cross-axis keys ignored.

The wrapper exposes `Root` and `Item` slots that match Base UI's slot names exactly. CVA variants cover `size` (`sm`, `md`, `lg`), `orientation`, and `disabled`. Controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) usage both work. Rendering with zero children emits a structured warning under the `[unbranded-ds]` console namespace; rendering with one or two items is fine.
