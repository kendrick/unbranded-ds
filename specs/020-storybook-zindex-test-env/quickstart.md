# Quickstart: verify the re-enabled stacking gate

Prerequisite: spec 019's test-runner gate is present (it is, on this branch's base). All commands run from the repo root.

## 1. Reproduce the failure (before the fix)

Remove `tags: ['!test']` from `packages/react/src/components/Dialog/Dialog.stories.tsx`, then:

```bash
pnpm --filter @unbranded-ds/storybook test:storybook
```

Expect `TooltipStacksAboveDialog` to FAIL: `getComputedStyle().zIndex` is `auto`, so `Number.parseInt(...)` is `NaN` and `toBeGreaterThan(NaN)` throws. This confirms the gap before fixing it (test-driven: see the red first).

## 2. Apply the fix and confirm the gate is green

Apply the test-env fix from `research.md` so the `z-(--z-index-*)` declarations resolve, then:

```bash
pnpm --filter @unbranded-ds/storybook test:storybook
```

Expect `TooltipStacksAboveDialog` to PASS — the tooltip stop (60) resolves above the dialog stop (50) — and every other previously-green story to still pass (FR-009 / SC-007).

## 3. Confirm the gate discriminates (US2, one-time manual check)

Temporarily break the stacking in the rendered DOM (a scratch edit giving the dialog content a stop at or above the tooltip's), run the gate, and confirm it FAILS and names the story. Revert the scratch edit before committing. Do not commit an always-failing test — the token-ordering invariant is already guarded permanently by the tokens' `defaults.test.ts` (clarification Q1).

## 4. Confirm the generalization (US3, optional manual spot-check)

In the runner, read the computed z-index of another `z-(--z-index-*)` consumer — the skip link's `--z-index-max` or the select popover's `--z-index-popover` — and confirm it returns a number, not `auto`. This is a spot-check, not a committed test (clarification Q2: expected side effect).

## 5. Land the change

- Remove `tags: ['!test']` and the stale quarantine comment from `Dialog.stories.tsx`.
- Add an empty changeset (`pnpm changeset --empty`) whose body explains that the `packages/react` edit is story-only and not in the published bundle, so no version bump (mirrors `.changeset/storybook-test-runner-gate.md`).
- Run any new code comment explaining the fix through the `humanizer` skill before merge.
