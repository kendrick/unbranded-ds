# Tasks: Constitution-driven retrofit (Part A — token consumption)

**Input**: Design documents from `/specs/010-constitution-retrofit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: One new interaction test for the nested-overlay bug fix (US1). The existing unit, interaction, and a11y suites must stay green (verified in polish).

**Organization**: By component file, not strictly by user story. The swaps cluster by file — an overlay component does both its z-index (US1) and motion (US2) swap, and Select also does ring (US3) — so giving each file one owner avoids conflicts and lets all ten swaps run in parallel. Each task is story-tagged for traceability. This follows the per-file pattern used in specs 007 and 008.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different file, no dependency on an incomplete task)
- All component paths are under `packages/react/src/components/`

---

## Phase 1: Setup

- [ ] T001 Confirm baseline green before changes: `pnpm --filter @unbranded-ds/react test && pnpm typecheck && pnpm --filter @unbranded-ds/storybook build`.

---

## Phase 2: Foundational (Syntax Lock — Blocking)

**⚠️ This gate blocks every swap. It pins the exact consumption strings so the ten parallel edits are uniform and can't drift — and it de-risks the one pattern that can silently fail.**

- [ ] T002 Verify the four consumption patterns against a real Tailwind v4 build and lock them in `specs/010-constitution-retrofit/contracts/token-consumption-patterns.md`. In a scratch Storybook story, exercise: `ring-(length:--ring-width)` (confirm 3px ring referencing the var), `z-(--z-index-overlay)` (confirm `z-index: var(...)`), `ease-decelerate`/`ease-accelerate` (confirm the token cubic-beziers), and critically `duration-(--duration-fast)` on **both** a `transition` element and a `data-open:animate-in` keyframe element (confirm it retimes both). Record the exact verified strings (and any fallbacks used) in the contract, then remove the scratch story.

**Checkpoint**: Four locked strings exist. All component swaps can now run in parallel.

---

## Phase 3: Per-component token swaps (US1 + US2 + US3)

**Goal**: Every in-scope `ring-3`, overlay `z-50`, and overlay open/close timing references its spec 008 token. Copy the locked strings from T002. Leave `ring-1`, SkipLink's `z-50`, and all micro-transitions untouched.

**Independent Test**: After each file, `pnpm typecheck` passes and a grep of that file shows no in-scope hardcoded value remains.

**All ten tasks are [P] — disjoint files, no shared state.**

### Ring-only components

- [ ] T003 [P] [US3] Swap both `ring-3` for the locked ring snippet in `Button/Button.tsx`.
- [ ] T004 [P] [US3] Swap both `ring-3` in `Checkbox/Checkbox.tsx`.
- [ ] T005 [P] [US3] Swap both `ring-3` (`focus-visible` + `aria-invalid`) in `Input/Input.tsx`.
- [ ] T006 [P] [US3] Swap both `ring-3` in `Switch/Switch.tsx`.
- [ ] T007 [P] [US3] Swap the `ring-3` on the thumb in `Slider/Slider.tsx`.
- [ ] T008 [P] [US3] Swap the `ring-3` in `SegmentedControl/SegmentedControl.tsx`.
- [ ] T009 [P] [US3] Swap the `focus-visible:ring-3` in `SkipLink/SkipLink.tsx`. Leave `focus-visible:z-50` as-is (excluded per clarify).

### Overlay components

- [ ] T010 [P] [US1] [US2] In `Dialog/Dialog.tsx`: swap both `z-50` (backdrop + popup) for `z-(--z-index-overlay)`; swap `duration-100` on both for `duration-(--duration-fast)`; keep the `animate-in/out` / `fade` / `zoom` keyframe presets. Apply the per-direction easing if T002 confirmed it reaches `animation-timing-function`, else tokenize duration only.
- [ ] T011 [P] [US1] [US2] [US3] In `Select/Select.tsx`: swap both `z-50` (positioner + popup) for `z-(--z-index-popover)`; swap `duration-100` for `duration-(--duration-fast)` (keyframe presets stay); and swap both `ring-3` on the trigger for the locked ring snippet.
- [ ] T012 [P] [US1] [US2] In `Tooltip/Tooltip.tsx`: swap `z-50` for `z-(--z-index-tooltip)`; swap `transition-[opacity,transform] duration-150` to use `duration-(--duration-fast)` plus `ease-standard` (or `data-open:ease-decelerate data-closed:ease-accelerate`); keep `motion-reduce:*` and `data-instant:*` intact.

**Checkpoint**: No in-scope hardcoded values remain; every overlay reads the scale and the motion tokens.

---

## Phase 4: Nested-overlay bug-fix test (US1)

- [ ] T013 [US1] Add an interaction test for the stacking fix in `Dialog/Dialog.stories.tsx`: a story that renders a tooltip trigger inside an open dialog, opens the tooltip in a `play` function, and asserts the tooltip stacks above the dialog (computed z-index, or that the tooltip content is the topmost rendered layer). Depends on T010 and T012.

**Checkpoint**: The live bug is covered by a regression test.

---

## Phase 5: Polish & Release

- [ ] T014 Full verification: `pnpm typecheck`, `pnpm --filter @unbranded-ds/react lint` (no literals introduced), `pnpm --filter @unbranded-ds/react test`, `pnpm --filter @unbranded-ds/storybook build && pnpm --filter @unbranded-ds/storybook test:storybook` (interaction + a11y). Then grep for residuals: `grep -rn "ring-3" packages/react/src/components` (none) and `grep -rn "z-50" packages/react/src/components/{Dialog,Select,Tooltip}` (none). Confirm SkipLink's `z-50` and the `ring-1` rings still present.
- [ ] T015 Add `.changeset/*.md` declaring `@unbranded-ds/react: patch`, naming the three swaps and calling out the nested-overlay bug fix. No consumer migration note.

---

## Dependencies & Execution Order

### Phase order

- **Setup (T001)** → **Foundational (T002)** → **Per-component swaps (T003–T012, parallel)** → **Bug-fix test (T013)** → **Polish (T014–T015)**.

### Hard dependencies

- T002 blocks T003–T012 (they copy its locked strings).
- T013 depends on T010 (Dialog) and T012 (Tooltip).
- T014 depends on all swaps + T013.
- T015 is last.

### Parallel opportunities

- **The core is 10-way parallel**: T003–T012 are ten disjoint component files. Hand each to its own worker after T002 lands.
- Nothing else parallelizes meaningfully (T001, T002, T013, T014, T015 are gates or single-file).

---

## Parallel Example: the swap fan-out

```bash
# After T002 locks the consumption strings, ten workers in parallel:
T003 Button     T004 Checkbox   T005 Input      T006 Switch     T007 Slider
T008 SegmentedControl           T009 SkipLink
T010 Dialog     T011 Select     T012 Tooltip
# No two touch the same file. Converge, then T013 (test) → T014 (verify) → T015 (changeset).
```

---

## Implementation Strategy

### MVP (US1 — the bug fix)

T001 → T002 → T010 (Dialog) + T012 (Tooltip) + T011 (Select) → T013 (test). Ships the nested-overlay fix and the overlay token consumption. Independently valuable; the ring swap (US3) can follow.

### Full delivery

1. Setup + syntax-lock (T001–T002).
2. All ten swaps in parallel (T003–T012).
3. Bug-fix test (T013).
4. Verify + changeset (T014–T015).

### Notes

- Copy the locked strings from T002 verbatim; do not improvise per-file syntax.
- The `duration`-on-keyframe path is the one real risk — T002 must confirm it before T010/T011 rely on it.
- SkipLink: ring swaps, z-50 stays. Select: all three swaps. `ring-1`: never.
- No sidecar or TSDoc edits — internal class changes only, public API unchanged.
