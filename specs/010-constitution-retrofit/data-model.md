# Data Model: Constitution-driven retrofit (Part A)

**Phase 1 output** | **Date**: 2026-06-11

No runtime data. The "model" is the catalog of swap sites: which file, which hardcoded value, which token replaces it. This is the work list the parallel edits execute against.

## Swap-site catalog

### Ring width (`ring-3` → `ring.width`)

| Component | Sites | Form |
| --- | --- | --- |
| Button | 2 | `focus-visible:ring-3` → `focus-visible:ring-(length:--ring-width)` |
| Checkbox | 2 | same pattern |
| Input | 2 | `focus-visible:ring-3`, `aria-invalid:ring-3` |
| Switch | 2 | same |
| Select | 2 | `focus-visible:ring-3`, `aria-invalid:ring-3` (on the trigger) |
| Slider | 1 | `focus-visible:ring-3` (on the thumb) |
| SegmentedControl | 1 | `focus-visible:ring-3` |
| SkipLink | 1 | `focus-visible:ring-3` (ring swapped; z-50 retained) |

~13 sites, 8 components. Default value unchanged (3px), so focus rings render identically; the gain is a themeable width.

### Z-index (`z-50` → the scale, overlay components only)

| Component | Sites | Stop | Form |
| --- | --- | --- | --- |
| Dialog | 2 (backdrop, popup) | `overlay` (50) | `z-50` → `z-(--z-index-overlay)` |
| Select | 2 (positioner, popup) | `popover` (55) | `z-50` → `z-(--z-index-popover)` |
| Tooltip | 1 (popup) | `tooltip` (60) | `z-50` → `z-(--z-index-tooltip)` |

5 sites, 3 components. The ordering (overlay 50 < popover 55 < tooltip 60) is what fixes the nested-overlay bug: a Select dropdown inside a Dialog now sits above the dialog, and a Tooltip sits above both.

**SkipLink** `focus-visible:z-50` (1 site) → `z-(--z-index-max)`. Revised from the original exclusion: spec 010 adds a `z-index.max` (9999) token so the focus-revealed skip link sits above every overlay.

### Motion (overlay open/close timing → `motion` tokens)

| Component | Mechanism | Current | After |
| --- | --- | --- | --- |
| Tooltip | `transition-[opacity,transform]` | `duration-150` | `duration-(--duration-fast)` + `ease-standard` (or `data-open:ease-decelerate data-closed:ease-accelerate`) |
| Dialog | keyframe `animate-in/out` | `duration-100` | `duration-(--duration-fast)`; keyframe presets stay |
| Select | keyframe `animate-in/out` | `duration-100` | `duration-(--duration-fast)`; keyframe presets stay |

3 components. The `fade`/`zoom`/`slide` keyframe presets are not motion tokens and stay. `motion-reduce:*` and `data-instant:*` handling on Tooltip stays intact.

## Entities

- **Swap site**: one location in a component class string holding a value a spec 008 token now names. Rewritten to the token-referencing form from `contracts/token-consumption-patterns.md`.
- **Overlay layer**: one of three stacking depths (overlay, popover, tooltip). Each overlay component maps to exactly one.
- **Excluded site**: a hardcoded value intentionally retained — every `ring-1` hairline border, and every micro-transition `transition-*`/`duration-*` on an interactive (non-overlay) component. (SkipLink's z is no longer excluded; it reads `z-index.max`.)

## Invariants after the retrofit

- No `ring-3` in component source (all → `ring.width`).
- No `z-50` anywhere; the overlays read a scale stop and SkipLink reads `z-index.max`.
- Overlay open/close durations reference a `motion` duration token; the keyframe presets are unchanged.
- A tooltip inside an open dialog stacks above it.
- Default rendered output is unchanged except the nested-overlay order and the overlay timing.
