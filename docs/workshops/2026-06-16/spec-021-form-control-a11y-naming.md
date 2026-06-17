# Spec 021 — Fix the accessible-name pattern in form-control docs (and consider a dev warning)

**Target version:** patch on `@unbranded-ds/react` if a dev warning is added; docs-only otherwise
**Depends on:** spec-019 (the test-runner gate, which surfaced this)
**Blocks:** consumers shipping inaccessible Checkbox/Switch/Slider because the docs taught the wrong pattern
**Status:** brief (not yet specified)

> Captured on 2026-06-16 while landing spec 019. Turning on the real-browser axe pass surfaced that Checkbox, Switch, Slider, Select, and the File input rendered without accessible names. The stories were fixed in spec 019; the component docs that teach the broken pattern were deferred here.

## The problem

Base UI's Checkbox, Switch, and Slider expose a `role="checkbox"` / `role="switch"` / `role="slider"` element (for Slider, a clipped `<input type="range">`). A native `<label>` — whether wrapping the control or associated with `htmlFor` — only names *native* form controls, not these ARIA-role elements. So the documented pattern leaves the control with no accessible name, and axe flags `aria-toggle-field-name` / `label`.

The `@example` blocks in `Checkbox.tsx`, `Switch.tsx`, and `Slider.tsx`, and the matching `*.usage.md` sidecars, all show this broken pattern. A consumer who copies them ships an inaccessible control. The fix that spec 019 applied to the stories — `aria-label` for an unlabeled control, `aria-labelledby` pointing at the visible `<Label>` for a labeled one — is the pattern the docs should teach.

Note: the example Next.js app already uses the correct `aria-labelledby` pattern (`gallery.tsx`), so nothing shipped is inaccessible. This is a documentation defect, not a runtime one.

## The fix

- Update the `@example` blocks in `Checkbox.tsx`, `Switch.tsx`, and `Slider.tsx` to use `aria-label` / `aria-labelledby` instead of the native-label pattern.
- Update the `Checkbox.usage.md`, `Switch.usage.md`, and `Slider.usage.md` sidecars the same way (and check `Select` / `Input` for the same advice).
- Give the Range slider story's two thumbs distinct names (`"Minimum"` / `"Maximum"`) rather than the placeholder `"Value"` spec 019 used to go green.
- Consider a dev-time `warn()` (the existing `lib/warn.ts`) when a Checkbox / Switch / Slider renders with no `aria-label` / `aria-labelledby`, so the footgun is caught at the source rather than only by a story's axe pass. This is the part that would carry a `@unbranded-ds/react` version bump; weigh it against false positives (a control inside a `<fieldset>` with a legend, say).

## Scope guardrails

- The components' runtime behavior is correct; this is about the guidance they ship and an optional ergonomic guard. Do not change the rendered DOM of the controls themselves beyond the optional warning.

## References

- Spec 019 — the gate that surfaced this; the story-level fixes (aria-label / aria-labelledby) are the reference pattern.
- The Base UI source confirms `SliderThumb` forwards `aria-label` to the range input, and Checkbox/Switch need `aria-label`/`aria-labelledby` on the control.
