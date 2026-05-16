---
'@unbranded-ds/react': minor
---

Add `<Slider>` — a draggable numeric input wrapping Base UI's Slider primitives. Supports single-value (`[50]`) and range (`[20, 80]`) from day one. Pointer drag, keyboard, and touch all resolve to the same `onValueChange` pathway, with `aria-valuenow` exposed on every thumb. Invalid props (value out of range, `step <= 0`, `min >= max`) clamp to safe defaults and emit a structured `console.warn('[unbranded-ds]', { component: 'Slider', issue, ... })` instead of throwing, so a misconfigured slider never breaks the page that hosts it.
