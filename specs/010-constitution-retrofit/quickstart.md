# Quickstart: Constitution-driven retrofit (Part A)

How to implement and verify spec 010. All edits are in `packages/react/src/components/`.

## Prerequisites

- Branch `010-constitution-retrofit` checked out (off `main`, which carries the spec 008 tokens)
- `pnpm install` done
- Baseline green: `pnpm --filter @unbranded-ds/react test && pnpm typecheck`

## Order of work

### 1. Lock the syntax (do this first, solo)

Pick one ring component (e.g. Button) and one of each overlay mechanism (Tooltip for transition, Dialog for keyframe). Apply the four patterns from `contracts/token-consumption-patterns.md`, build, and confirm:

```bash
pnpm --filter @unbranded-ds/react build
pnpm --filter @unbranded-ds/storybook build
# inspect the generated CSS / open Storybook and confirm:
#  - focus ring still 3px and references --ring-width
#  - the overlay sits at the right z and a tooltip-in-dialog stacks correctly
#  - the duration token actually retimes BOTH Tooltip (transition) and Dialog (animate-in)
```

Write the four exact verified strings into `contracts/token-consumption-patterns.md`. Everything downstream copies them.

### 2. Per-component swaps (parallel after step 1)

Ten disjoint files; one worker each. Copy the locked snippets.

Ring-only: `Button` `Checkbox` `Input` `Switch` `Slider` `SegmentedControl` `SkipLink`
Overlay (z-index + motion, Select also ring): `Dialog` `Select` `Tooltip`

Per file: swap every in-scope `ring-3`, overlay `z-50`, and overlay duration/easing. Leave `ring-1`, SkipLink's `z-50`, and all micro-transitions alone.

### 3. Verify

```bash
pnpm typecheck
pnpm --filter @unbranded-ds/react lint        # no literals introduced
pnpm --filter @unbranded-ds/react test         # unit
pnpm --filter @unbranded-ds/storybook build && pnpm --filter @unbranded-ds/storybook test:storybook   # interaction + a11y

# residual-hardcode grep (expect empty):
grep -rn "ring-3" packages/react/src/components            # none
grep -rn "z-50" packages/react/src/components/Dialog packages/react/src/components/Select packages/react/src/components/Tooltip   # none
```

Add an interaction test for the bug fix: render a tooltip trigger inside an open dialog, open the tooltip, assert it is above the dialog (computed z-index or visual order).

### 4. Changeset

```bash
pnpm changeset    # @unbranded-ds/react: patch
```

Message names the three swaps and calls out the nested-overlay bug fix. No consumer migration.

## Watch-outs

- **The duration-on-keyframe path is the risk.** A `duration-*` that only retimes transitions would silently miss Dialog/Select animations. Verify it in step 1 before trusting it across the parallel edits.
- **SkipLink is half in, half out**: its `ring-3` swaps, its `z-50` stays.
- **`ring-1` stays**: only `ring-3` (the focus ring) maps to `ring.width`.
- **No sidecar or TSDoc edits**: these are internal class changes; the documented API is unchanged.
- **SSR**: pure class-string edits, no browser globals introduced.
