---
'@unbranded-ds/tokens': minor
---

Grow the token schema and loosen runtime theme validation.

New tokens: `font-serif`, a `motion` category (durations `fast`/`base`/`slow` and easings `standard`/`decelerate`/`accelerate`, emitted as Tailwind-aligned `--ease-*` and `--duration-*`), and `size-2xl`/`size-3xl`. Two optional, non-breaking additions land alongside them: `ring.width` and a `z-index` layering scale (`overlay`/`popover`/`tooltip`, ordered so a tooltip stacks above a dialog).

`validateTheme` now accepts a partial theme. It resolves the override against the canonical defaults and validates the merged result, so a theme may change any subset of categories and inherit the rest. Contrast runs on the merged colors, so a pair where one side is overridden and the other inherited is no longer skipped. Existing complete themes keep validating without change; they inherit the new tokens from the defaults.

The light theme's `muted-foreground` and `destructive` colors move slightly (4.40 and 3.61 to 4.55:1) to meet WCAG AA, which the previous contrast skip had hidden.
