# Contract: Token consumption patterns

The canonical class form for consuming each spec 008 token. Every component copies these so the swaps are uniform. The syntax-lock step verifies each against a real Tailwind v4 build before the parallel edits begin; if a form does not generate, the whole set updates here once and the components follow.

## Ring width

```
ring-3  →  ring-(length:--ring-width)
```

Applies wherever a focus ring is set (`focus-visible:ring-3`, `aria-invalid:ring-3`). The `length:` hint disambiguates the custom property as a width.

- Fallback if the shorthand does not generate: `ring-[length:var(--ring-width)]`.
- Default resolves to 3px (unchanged appearance).
- Does NOT apply to `ring-1` (hairline border ring, out of scope).

## Z-index

```
z-50 (Dialog backdrop + popup)   →  z-(--z-index-overlay)
z-50 (Select positioner + popup) →  z-(--z-index-popover)
z-50 (Tooltip popup)             →  z-(--z-index-tooltip)
```

- Fallback: `z-[var(--z-index-overlay)]` etc.
- Ordering overlay (50) < popover (55) < tooltip (60) is the nested-overlay fix.
- SkipLink's `focus-visible:z-50` is NOT swapped.

## Duration

```
duration-100 / duration-150  →  duration-(--duration-fast)
```

- Fallback: `duration-[var(--duration-fast)]`.
- MUST be verified to apply to keyframe `animate-in/out` (Dialog, Select), not only to `transition` (Tooltip). This is the highest-risk pattern.

## Easing

```
(implicit browser default)  →  ease-standard
                            or  data-open:ease-decelerate data-closed:ease-accelerate
```

- `ease-*` are real utilities (spec 008 emits the `--ease-*` namespace).
- Per-direction variants are the recommended form for overlays (enter decelerates, exit accelerates).
- For keyframe animations, confirm the easing reaches `animation-timing-function`; if not, leave the keyframe preset's easing and tokenize only the duration.

## Verification (the syntax-lock step)

Build a throwaway sample using each form and confirm against the generated CSS / a Storybook build that:

1. `ring-(length:--ring-width)` emits a 3px ring referencing the variable.
2. `z-(--z-index-overlay)` emits `z-index: var(--z-index-overlay)`.
3. `duration-(--duration-fast)` retimes both a `transition` and a keyframe `animate-in` element.
4. `ease-decelerate` / `ease-accelerate` resolve to the token cubic-beziers.

Lock the four exact strings here, then the per-component edits copy them verbatim.
