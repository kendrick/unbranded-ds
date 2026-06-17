# Contract: the accessible-name dev warning

The observable contract of FR-007. This is what the unit test asserts and what a consumer or agent can rely on.

## Trigger

When a Checkbox, Switch, or Slider thumb mounts in a development build (`process.env.NODE_ENV !== 'production'`) with neither a non-empty `aria-label` nor a non-empty `aria-labelledby` on the control, exactly one warning is emitted via `warn()`.

## Payload

```jsonc
{
  "component": "Checkbox",                 // or "Switch" | "Slider"
  "issue": "missing-accessible-name",
  "remedy": "Add aria-label, or aria-labelledby referencing a visible label."
}
```

Emitted as `console.warn('[unbranded-ds]', payload)`. The `issue` code is stable and agent-matchable (Constitution XI.4).

## Behavior matrix

| Control state | Environment | Warns? |
|---------------|-------------|--------|
| no `aria-label`, no `aria-labelledby` | development | yes, once per mount |
| `aria-label="Volume"` | development | no |
| `aria-labelledby="some-id"` | development | no |
| `aria-label=""` (empty) | development | yes (empty names nothing) |
| no name | production | no |
| named by native `<label>` only (Slider thumb) | development | yes — known false positive; remedy is `aria-labelledby` (clarify decision: no suppression ships) |

## Non-goals (explicit)

- Does not read the DOM or compute an accessible name.
- Does not inspect `title`, ancestor `fieldset`/`legend`, or native `<label>` association.
- Does not apply to Select or the File input.
- Ships no suppression mechanism. A per-instance opt-out prop may be added in a later patch if real demand appears (additive, non-breaking).

## Range sliders

A two-thumb slider runs the check per thumb. Two unnamed thumbs produce two warnings (one per control), which is correct — each thumb is a distinct `role="slider"`.
