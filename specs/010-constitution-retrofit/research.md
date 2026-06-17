# Research: Constitution-driven retrofit (Part A)

**Phase 0 output** | **Date**: 2026-06-11

## Tailwind v4 consumption syntax

**Decision**: Use the v4 custom-property utility forms, with a length type hint where the property is ambiguous.

| Token               | Consumption form                                                         | Confidence                                                                 |
| ------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `ring.width`        | `ring-(length:--ring-width)`                                             | Verify at the syntax-lock step; fallback `ring-[length:var(--ring-width)]` |
| `z-index.overlay`   | `z-(--z-index-overlay)`                                                  | Confirmed (v4 `z-(<custom-property>)` documented)                          |
| `z-index.popover`   | `z-(--z-index-popover)`                                                  | Confirmed                                                                  |
| `z-index.tooltip`   | `z-(--z-index-tooltip)`                                                  | Confirmed                                                                  |
| `motion.duration.*` | `duration-(--duration-fast)`                                             | Verify it applies to keyframe animations, not only transitions             |
| `motion.easing.*`   | `ease-standard` / `ease-decelerate` / `ease-accelerate` (real utilities) | Confirmed (spec 008 emits the `--ease-*` namespace)                        |

**Rationale**: Tailwind v4 documents `z-(<custom-property>)` for z-index and the `text-(length:--my-var)` type-hint pattern for length-ambiguous properties. The ring utility takes a width, so `ring-(length:--ring-width)` follows the same hinted-custom-property convention. The easings are real utilities because spec 008 emits them under the `--ease-*` theme namespace.

**Alternatives considered**: bracket arbitrary values (`z-[var(--z-index-overlay)]`, `ring-[length:var(--ring-width)]`). These work and are the fallback, but the `(--var)` shorthand is the idiomatic v4 form and reads cleaner at 13+ sites. Setting `--default-ring-width: var(--ring-width)` in the preset and using bare `ring` was rejected: it changes Tailwind's global ring default and still requires editing every `ring-3`, for no localized benefit, while risking other bare-`ring` usages.

## Easing mapping (the clarify left this to planning)

**Decision**: Overlay enter animations use `ease-decelerate`; exit animations use `ease-accelerate`. Applied per direction with data-attribute variants: `data-open:ease-decelerate data-closed:ease-accelerate`.

**Rationale**: The motion tokens are named by intent. `decelerate` (cubic-bezier(0,0,0.2,1), an ease-out) suits something entering and settling; `accelerate` (cubic-bezier(0.4,0,1,1), an ease-in) suits something leaving. This is the standard Material/HIG enter-exit convention, and Base UI exposes `data-open` / `data-closed` state attributes that map cleanly to Tailwind variants. Where a single easing is simpler and the per-direction split does not read, `ease-standard` is the acceptable baseline.

**Alternatives considered**: one `ease-standard` for both directions (simpler, but ignores the named-intent tokens); leaving easing implicit (the current state, which ties the feel to browser defaults rather than the design system).

## Transition vs keyframe animation

**Decision**: Treat the two overlay animation mechanisms separately and verify the duration token reaches both.

- **Tooltip** animates via `transition-[opacity,transform] duration-150`. The duration token (`duration-(--duration-fast)`) sets `transition-duration`, and `ease-*` sets `transition-timing-function`. Straightforward.
- **Dialog and Select** animate via keyframe utilities (`data-open:animate-in fade-in-0 zoom-in-95`, `data-closed:animate-out ...`) with `duration-100`. Here the duration must set `animation-duration`, and easing would set `animation-timing-function`, not the transition equivalents.

**Rationale**: A `duration-*` utility that only sets `transition-duration` would silently fail to retime a keyframe animation. The syntax-lock step builds a sample of each mechanism and confirms the token duration actually changes the rendered timing in both, before the parallel edits depend on it. This is the same class of "the utility looked applied but did not generate" failure seen in the spec 007 Storybook incident, so it gets an explicit verification.

**Open for the implementer**: the `animate-in`/`animate-out` keyframe presets (fade, zoom, slide) stay; only the duration and, where applicable, the timing function move to tokens.

## Duration value mapping

**Decision**: Map the overlay open/close durations to `duration-fast` (120ms).

**Rationale**: Current values are 100ms (Dialog, Select) and 150ms (Tooltip). `fast` (120ms) is the nearest token and keeps overlays snappy. The spec accepts that timing shifts slightly to the design-system value; interaction tests assert behavior, not exact milliseconds.

## Scope confirmations (from the spec + grep)

- **Ring sites**: ~13 in component source across Button, Checkbox, Input, Switch, Slider, SegmentedControl, SkipLink, and Select (the spec's "14" counts one occurrence inside `Input.usage.md`, a sidecar doc that is not a swap target). All are `focus-visible:ring-3` or `aria-invalid:ring-3`.
- **Overlay z-50 sites**: 5 across Dialog (2: backdrop + popup), Select (2: positioner + popup), Tooltip (1). SkipLink's `focus-visible:z-50` is the 6th and is excluded.
- **`ring-1`**: a hairline border ring on cards and popovers, left untouched. Distinct from the focus-ring width.
