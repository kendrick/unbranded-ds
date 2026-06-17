# Phase 1 Data Model: Fix the accessible-name pattern in form-control docs

This feature has no persistent data. The "entities" are the warning's decision inputs/outputs and the canonical naming pattern the docs teach.

## The "named" predicate (props-only)

The single input the warning reasons about, read from the control's own props:

| Field | Type | Meaning |
|-------|------|---------|
| `aria-label` | `string?` | A non-empty value names the control. |
| `aria-labelledby` | `string?` | A non-empty value names the control (the id is not resolved against the DOM). |

`named === isNonEmpty(props['aria-label']) || isNonEmpty(props['aria-labelledby'])`. An empty string names nothing and therefore does **not** count as named. No other source (native `<label>`, `title`, ancestor `fieldset`/`legend`) is inspected — by decision, the warning is props-only and the automated accessibility check in stories remains the full source of truth.

## The warn payload (structured output)

Emitted via `warn()` (`lib/warn.ts`), conforming to `WarnPayload` and the Constitution XI.4 structured-failure convention:

| Field | Value |
|-------|-------|
| `component` | `'Checkbox'` \| `'Switch'` \| `'Slider'` |
| `issue` | `'missing-accessible-name'` (new code, alongside `no-items` / `invalid-bounds` / `invalid-step` / `value-out-of-range`) |
| `remedy` | `'Add aria-label, or aria-labelledby referencing a visible label.'` |

## Scope: which controls warn

| Control | Warns? | Detection site | Why |
|---------|--------|----------------|-----|
| Checkbox | Yes | the `Checkbox` component | `role="checkbox"`; native label names nothing |
| Switch | Yes | the `Switch` component | `role="switch"`; native label names nothing |
| Slider | Yes | each `SliderThumb` | `role="slider"` is the thumb; per-thumb naming covers single + range |
| Select | No | — | trigger named by value/placeholder content; props-only would false-positive |
| Input (incl. file) | No | — | native `<input>`; `htmlFor` names it correctly |

## The canonical naming pattern (what the docs teach)

| Case | Checkbox | Switch | Slider |
|------|----------|--------|--------|
| Unlabeled | `aria-label` on the control | `aria-label` on the control | `aria-label` on each `Slider.Thumb` |
| Labeled | wrapping `<label>` (click-to-toggle) + `aria-labelledby` → `<Label id>` | `<Label htmlFor id>` (click-to-toggle) + `aria-labelledby` → that id | per-thumb `aria-label` ("Minimum"/"Maximum") |

The labeled pattern keeps the native interaction affordance and adds `aria-labelledby` to name the ARIA element. Reference implementations: `Checkbox.stories.tsx:34-37`, `Switch.stories.tsx:52-53`, `Slider.tsx:524-525`.

## State transitions

None. The predicate is evaluated once per mount; the warning is a fire-and-forget dev-only console signal.
