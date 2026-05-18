---

description: "Task list for spec 006 — sidecar retrofit"
---

# Tasks: Sidecar retrofit

**Input**: Design documents in [`/specs/006-sidecar-retrofit/`](.)
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/sidecar-shape-amendments.md](./contracts/sidecar-shape-amendments.md), [quickstart.md](./quickstart.md)

**Tests**: This spec ships documentation. The CI validator at `scripts/validate-sidecars.ts` (compile-tests every `tsx` code block via `tsc --noEmit`) is the only automated test surface. No new test tasks are generated; the validator runs on every PR as part of the existing CI verify job.

**Organization**: Tasks are grouped by user story. US1 (seven single-component sidecars) and US2 (seven compound-component sidecars) are independent — either ships alone as a viable partial release. The Polish phase contains the FR-014a backfill PR which depends on every prior sidecar PR.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different files, no dependencies on incomplete tasks
- **[Story]**: Which user story this task belongs to (US1 or US2)
- Each task targets exactly one PR; PRs in the same phase are independent unless noted

## Path conventions

- Component sidecars: `packages/react/src/components/<Component>/<Component>.usage.md`
- Per-PR changesets: `.changeset/add-<component-kebab>-sidecar.md`
- Spec 007 inbox (appended only): `specs/006-sidecar-retrofit/spec-007-inbox.md`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the spec 005 prerequisites are on `main` before per-component work starts.

- [ ] T001 Verify spec 005 prerequisites are merged to `main`: confirm `packages/react/src/components/_template/Component.usage.md` exists (sidecar template), `scripts/validate-sidecars.ts` exists and runs clean (compile validator), `AGENTS.md` at repo root contains the component index, and `.github/workflows/ci.yml` contains the "Validate sidecar code blocks" step. Run `pnpm exec tsx scripts/validate-sidecars.ts` once locally to confirm a green baseline.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: None. Documentation work has no foundational layer beyond the existing CI infrastructure.

> **Note**: Setup (Phase 1) is the only gate. Once T001 confirms green, US1 and US2 tasks can begin in parallel.

---

## Phase 3: User Story 1 — Single-component sidecars (Priority: P1) 🎯 MVP

**Goal**: Ship a `<Component>.usage.md` sidecar for each of the seven single-component shapes (flat prop API, no slot tree). Each sidecar is one PR.

**Independent Test**: After all seven PRs merge, `find packages/react/src/components -maxdepth 2 -name '*.usage.md' -not -path '*_template*'` returns the seven sidecar paths. Each file passes the CI validator. The AGENTS.md component index links to each one resolve.

### Implementation for User Story 1

> Each task below is one PR. Follow [quickstart.md](./quickstart.md) for the 9-step authoring procedure. All seven tasks are independent (different files, separate changesets) — they can land in any order.

- [ ] T002 [P] [US1] Author `packages/react/src/components/Button/Button.usage.md` from `packages/react/src/components/Button/Button.tsx` and `packages/react/src/components/Button/Button.stories.tsx`. Ship with `.changeset/add-button-sidecar.md` (`@unbranded-ds/react: patch`). Follow the source-of-truth rule from [contracts/sidecar-shape-amendments.md](./contracts/sidecar-shape-amendments.md#amendment-1-prop-table-source-of-truth-rule) for the prop table. Related section is forward-only — link only to sidecars already on `main`. Optional: append any TSDoc drift to `spec-007-inbox.md`.

- [ ] T003 [P] [US1] Author `packages/react/src/components/Checkbox/Checkbox.usage.md` from `packages/react/src/components/Checkbox/Checkbox.tsx` and `packages/react/src/components/Checkbox/Checkbox.stories.tsx`. Ship with `.changeset/add-checkbox-sidecar.md` (`@unbranded-ds/react: patch`). Accessibility prose names the keyboard interaction Base UI Checkbox provides (Space to toggle, focus behavior, ARIA state announcement). Related section is forward-only.

- [ ] T004 [P] [US1] Author `packages/react/src/components/Input/Input.usage.md` from `packages/react/src/components/Input/Input.tsx` and `packages/react/src/components/Input/Input.stories.tsx`. Ship with `.changeset/add-input-sidecar.md` (`@unbranded-ds/react: patch`). Common patterns demonstrate at least one pairing with Label (multi-component examples allowed per [FR-007a](./spec.md#functional-requirements)). Related section is forward-only.

- [ ] T005 [P] [US1] Author `packages/react/src/components/Label/Label.usage.md` from `packages/react/src/components/Label/Label.tsx` and `packages/react/src/components/Label/Label.stories.tsx`. Ship with `.changeset/add-label-sidecar.md` (`@unbranded-ds/react: patch`). Common patterns demonstrates wrapping Input or Switch. Variants and slots section uses the canonical placeholder for "no CVA axes, no compound slots" since Label has neither. Related section is forward-only.

- [ ] T006 [P] [US1] Author `packages/react/src/components/SkipLink/SkipLink.usage.md` from `packages/react/src/components/SkipLink/SkipLink.tsx` and `packages/react/src/components/SkipLink/SkipLink.stories.tsx`. Ship with `.changeset/add-skip-link-sidecar.md` (`@unbranded-ds/react: patch`). Accessibility prose names the visually-hidden-on-focus behavior and the recommended placement (first focusable element in `<body>`). Related section is forward-only.

- [ ] T007 [P] [US1] Author `packages/react/src/components/Switch/Switch.usage.md` from `packages/react/src/components/Switch/Switch.tsx` and `packages/react/src/components/Switch/Switch.stories.tsx`. Ship with `.changeset/add-switch-sidecar.md` (`@unbranded-ds/react: patch`). Accessibility prose names the keyboard activation (Space toggles, Enter on some primitives), focus ring, and ARIA `role="switch"` state announcement. Related section is forward-only.

- [ ] T008 [P] [US1] Author `packages/react/src/components/VisuallyHidden/VisuallyHidden.usage.md` from `packages/react/src/components/VisuallyHidden/VisuallyHidden.tsx` and `packages/react/src/components/VisuallyHidden/VisuallyHidden.stories.tsx`. Ship with `.changeset/add-visually-hidden-sidecar.md` (`@unbranded-ds/react: patch`). When-to-use prose distinguishes from `aria-label` (which the screen reader reads but DOM doesn't expose). Variants and slots section uses the canonical placeholder. Related section is forward-only.

**Checkpoint**: After T002-T008 all merge, US1 is complete. The seven single-component sidecars exist, the CI validator stays green, and the AGENTS.md links to each resolve. This is a viable MVP for spec 006 — the cohort can stop here and the work is shippable.

---

## Phase 4: User Story 2 — Compound-component sidecars (Priority: P2)

**Goal**: Ship a `<Component>.usage.md` sidecar for each of the seven compound-component shapes (consumed as a slot tree). Each sidecar is one PR with per-slot Props subsections.

**Independent Test**: After all seven PRs merge, each compound component's directory contains exactly one `<Component>.usage.md` (not separate per-slot files). Every named export appears as a Props subsection (proportional length per amendment 2). The CI validator stays green. The AGENTS.md component index links to each one resolve.

### Implementation for User Story 2

> Each task below is one PR. Follow [quickstart.md](./quickstart.md) for the 9-step authoring procedure plus the per-slot subsection rule from [contracts/sidecar-shape-amendments.md amendment 2](./contracts/sidecar-shape-amendments.md#amendment-2-compound-sidecar-props-coverage-depth). All seven tasks are independent.

- [ ] T009 [P] [US2] Author `packages/react/src/components/Card/Card.usage.md` from `packages/react/src/components/Card/Card.tsx` and `packages/react/src/components/Card/Card.stories.tsx`. Ship with `.changeset/add-card-sidecar.md` (`@unbranded-ds/react: patch`). Props section: one subsection per named export — `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`. Full table for the commonly composed ones; one-line "inherits all props from a styled `<div>`" for rarely-used ones. Variants and slots section names every sibling export with its role.

- [ ] T010 [P] [US2] Author `packages/react/src/components/Dialog/Dialog.usage.md` from `packages/react/src/components/Dialog/Dialog.tsx` and `packages/react/src/components/Dialog/Dialog.stories.tsx`. Ship with `.changeset/add-dialog-sidecar.md` (`@unbranded-ds/react: patch`). Props section: one subsection per named export — `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`, `DialogPortal`, `DialogOverlay`. Full tables for the composed slots; one-line "inherits from Base UI primitive — reach for this only when overriding mount point" for `DialogPortal` and `DialogOverlay`. Accessibility prose names focus trap, Escape close, outside-click behavior, scroll lock.

- [ ] T011 [P] [US2] Author `packages/react/src/components/SegmentedControl/SegmentedControl.usage.md` from `packages/react/src/components/SegmentedControl/SegmentedControl.tsx` and `packages/react/src/components/SegmentedControl/SegmentedControl.stories.tsx`. Ship with `.changeset/add-segmented-control-sidecar.md` (`@unbranded-ds/react: patch`). Props section: one subsection per named export. Common patterns demonstrate keyboard arrow navigation between items. Accessibility prose names the `role="tablist"` (or whatever the primitive uses) and arrow-key roving focus.

- [ ] T012 [P] [US2] Author `packages/react/src/components/Select/Select.usage.md` from `packages/react/src/components/Select/Select.tsx` and `packages/react/src/components/Select/Select.stories.tsx`. Ship with `.changeset/add-select-sidecar.md` (`@unbranded-ds/react: patch`). Props section: one subsection per named export. Note required-vs-optional slots in Variants and slots. Accessibility prose names listbox role, keyboard navigation (ArrowDown, ArrowUp, Home, End, Escape), and type-ahead.

- [ ] T013 [P] [US2] Author `packages/react/src/components/Slider/Slider.usage.md` from `packages/react/src/components/Slider/Slider.tsx` and `packages/react/src/components/Slider/Slider.stories.tsx`. Ship with `.changeset/add-slider-sidecar.md` (`@unbranded-ds/react: patch`). Props section: one subsection per named export (including `Slider.Indicator` if it's part of the exports). Accessibility prose names ARIA `role="slider"`, `aria-valuemin`/`max`/`now`, ArrowLeft/Right, Home/End behavior, PageUp/Down (if supported).

- [ ] T014 [P] [US2] Author `packages/react/src/components/Tabs/Tabs.usage.md` from `packages/react/src/components/Tabs/Tabs.tsx` and `packages/react/src/components/Tabs/Tabs.stories.tsx`. Ship with `.changeset/add-tabs-sidecar.md` (`@unbranded-ds/react: patch`). Props section: subsections for `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`. Common patterns demonstrate controlled vs uncontrolled. Accessibility prose names `role="tablist"`, arrow-key navigation, automatic vs manual activation.

- [ ] T015 [P] [US2] Author `packages/react/src/components/Tooltip/Tooltip.usage.md` from `packages/react/src/components/Tooltip/Tooltip.tsx` and `packages/react/src/components/Tooltip/Tooltip.stories.tsx`. Ship with `.changeset/add-tooltip-sidecar.md` (`@unbranded-ds/react: patch`). Props section: subsections for `Tooltip.Provider`, `Tooltip.Trigger`, `Tooltip.Content`. Common patterns include the `asChild` wrapping pattern (already in spec 005's contract example). Accessibility prose names hover delay, focus open, Escape close, touch behavior, `prefers-reduced-motion` handling.

**Checkpoint**: After T009-T015 all merge, US2 is complete. Together with US1, all 14 sidecars exist. The AGENTS.md index has zero 404 sidecar links. Inter-sidecar Related links may still be missing forward-looking entries — the backfill PR (Phase 5) addresses that.

---

## Phase 5: Polish — Related backfill (Cross-Cutting)

**Purpose**: Retroactively populate every sidecar's Related section once every peer exists on `main`. This task depends on every per-component PR (T002-T015) being merged.

- [ ] T016 Author the FR-014a Related backfill PR. Edit each existing sidecar's Related section (or add one if previously omitted) to link to every relevant peer now that the cohort is complete. Single-component sidecars naturally cluster (Label → Input, Switch; Button → Dialog, Tooltip), and compound sidecars often link to single-component peers used inside them. Ship with `.changeset/sidecar-related-backfill.md` (`@unbranded-ds/react: patch`). Re-run `pnpm exec tsx scripts/validate-sidecars.ts` locally before pushing — no `tsx` blocks should change but the validator is cheap. PR title: `docs: backfill sidecar Related sections`.

**Checkpoint**: After T016 merges, every sidecar's Related section reaches all peers. SC-005's "no broken links anywhere in the sidecar surface" condition is met. Spec 006 is complete.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: No dependencies — T001 runs immediately. Confirms spec 005 prerequisites are on `main`.
- **Foundational (Phase 2)**: Empty — nothing blocks user-story work beyond setup verification.
- **User stories (Phase 3, Phase 4)**: Both depend on T001. Once T001 is verified green, US1 and US2 may begin in parallel.
- **Polish (Phase 5)**: T016 depends on every T002-T015 being merged to `main`. Cannot start until the full cohort is complete.

### Within each user story

- All seven tasks are [P] — different files, separate changesets, no shared infrastructure modifications. They can land in any order.
- A reviewer for one PR is not blocked by another PR being open.

### Cross-story dependencies

- None. US1 and US2 are fully independent. The structural difference between flat vs per-slot Props sections is the only thing that distinguishes them, and neither story affects the other's authoring or validation.

### Parallel opportunities

- **All 14 component PRs can be open simultaneously**. Each touches one component directory plus one changeset file — no merge conflicts between PRs in the same phase.
- **Two reviewers can work the cohort in parallel** — one focused on single-component (Phase 3), one on compound (Phase 4) — since the cohorts exercise different parts of the sidecar contract.
- **One author can interleave** US1 and US2 work; the structural difference between phases doesn't impose ordering on a single author.

---

## Parallel example

```text
# After T001 verifies prerequisites, fire all seven US1 PRs in parallel:
T002 [P] [US1] Button.usage.md
T003 [P] [US1] Checkbox.usage.md
T004 [P] [US1] Input.usage.md
T005 [P] [US1] Label.usage.md
T006 [P] [US1] SkipLink.usage.md
T007 [P] [US1] Switch.usage.md
T008 [P] [US1] VisuallyHidden.usage.md

# Also fire all seven US2 PRs in parallel (no dependency on US1):
T009 [P] [US2] Card.usage.md
T010 [P] [US2] Dialog.usage.md
T011 [P] [US2] SegmentedControl.usage.md
T012 [P] [US2] Select.usage.md
T013 [P] [US2] Slider.usage.md
T014 [P] [US2] Tabs.usage.md
T015 [P] [US2] Tooltip.usage.md

# Once all 14 merge, run the backfill sequentially:
T016 Related backfill PR
```

A maximally parallel implementation opens all 14 PRs at once, lets reviewers churn through them in any order, then opens T016 once `main` carries every sidecar.

---

## Implementation strategy

### MVP first (US1 only)

1. Run T001 (verify prerequisites)
2. Author and merge T002-T008 (seven single-component sidecars)
3. **STOP and VALIDATE**: All seven `<Component>.usage.md` files exist; CI validator stays green; AGENTS.md links resolve
4. Spec 006 is shippable here as a partial release. US2 can ship as its own follow-up.

### Full delivery

1. Run T001 (verify prerequisites)
2. Author T002-T008 (US1) and T009-T015 (US2) in parallel — all 14 PRs can be open concurrently
3. Merge as reviewers approve, in any order — forward-only Related sections keep `main` consistent
4. After all 14 merge, run T016 (Related backfill)
5. Spec 006 complete

### Stop-at-checkpoint strategy

A team that wants to validate the sidecar pattern on a small batch first can ship a subset of US1 (e.g., Button + Label + Input) and pause before continuing. The forward-only Related rule and per-PR changeset make this naturally safe — no half-baked state on `main`. The backfill PR runs only when the team commits to the full 14.

---

## Notes

- [P] tasks = different files, no dependencies. Every per-component task is [P].
- Each task is one PR. Do not bundle multiple sidecars into one PR per FR-012.
- The `.tsx` no-touch rule (FR-015a) applies to every task. TSDoc drift goes to `spec-007-inbox.md`, not inline fixes.
- Prose passes through humanizer before merge — three-item lists in prose are forbidden (code unions are exempt).
- A reviewer for any task should run `pnpm exec tsx scripts/validate-sidecars.ts` locally if they amend the `tsx` blocks during review. The CI gate is the durable enforcement, but local runs catch regressions before push.
- The backfill PR (T016) is the only task that depends on every prior task. Plan accordingly — don't start T016 until the cohort is fully merged.
- The `spec-007-inbox.md` file may not exist when the first per-component PR lands. The first author who observes drift creates the file with a brief header; subsequent authors append.
