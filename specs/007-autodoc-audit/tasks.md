# Tasks: Autodoc legibility audit

**Input**: Design documents from `/specs/007-autodoc-audit/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No new tests. Existing test suite must remain green (FR-014). The validator extension (T001) is the only new verification code.

**Organization**: Tasks combine US1 (TSDoc) and US2 (story descriptions) per component, since both surfaces read from the same sidecar reference and both touch the same pair of files. All 14 component tasks are independent of each other and can run in parallel.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = TSDoc, US2 = story descriptions)

---

## Phase 1: Foundational (Validator Extension)

**Purpose**: Extend the sidecar validator to also compile-check TSDoc `@example` blocks, so CI catches broken examples as component work proceeds.

**⚠️ CRITICAL**: This task should land first so the validator catches broken `@example` blocks during the per-component work. However, component work can proceed in parallel since the validator only blocks the final CI-green check, not the writing itself.

- [ ] T001 [US1] Extend `scripts/validate-sidecars.ts` to extract `@example` code blocks from TSDoc comments in `packages/react/src/components/**/*.tsx` (excluding `.stories.tsx`, `.test.tsx`) and compile them via `tsc --noEmit` through the existing wrap + temp-dir pipeline

---

## Phase 2: Per-Component Audit — Batch A (Single components, no existing TSDoc)

**Goal**: Add structured TSDoc (6-section component template, 3-section prop template) and per-story descriptions to Button, Checkbox, Input, and Switch.

**Independent Test**: `pnpm typecheck` passes, `pnpm exec tsx scripts/validate-sidecars.ts` passes, Storybook builds without error for these components.

- [ ] T002 [P] [US1] [US2] Audit Button — add component-level TSDoc (6-section) and per-prop TSDoc (3-section) on `packages/react/src/components/Button/Button.tsx`; add per-story descriptions and remove duplicate argTypes on `packages/react/src/components/Button/Button.stories.tsx`. Closes inbox bullet 1 (add all 8 size values to ButtonProps TSDoc, remove stale argTypes options array).
- [ ] T003 [P] [US1] [US2] Audit Checkbox — add component-level TSDoc (6-section) and per-prop TSDoc (3-section) on `packages/react/src/components/Checkbox/Checkbox.tsx`; add per-story descriptions on `packages/react/src/components/Checkbox/Checkbox.stories.tsx`.
- [ ] T004 [P] [US1] [US2] Audit Input — add component-level TSDoc (6-section, no Keyboard interactions subsection) and per-prop TSDoc (3-section) on `packages/react/src/components/Input/Input.tsx`; add per-story descriptions on `packages/react/src/components/Input/Input.stories.tsx`.
- [ ] T005 [P] [US1] [US2] Audit Switch — add component-level TSDoc (6-section) and per-prop TSDoc (3-section) on `packages/react/src/components/Switch/Switch.tsx`; add per-story descriptions on `packages/react/src/components/Switch/Switch.stories.tsx`.

**Checkpoint**: Batch A complete. Four single components fully documented.

---

## Phase 3: Per-Component Audit — Batch B (Single components, existing/simple TSDoc)

**Goal**: Update or add structured TSDoc and per-story descriptions to Label, SkipLink, and VisuallyHidden. SkipLink and VisuallyHidden have existing TSDoc that needs restructuring to match the 6-section template.

**Independent Test**: Same as Batch A — typecheck, validator, Storybook build.

- [ ] T006 [P] [US1] [US2] Audit Label — add component-level TSDoc (6-section, no Keyboard interactions subsection) and per-prop TSDoc (3-section) on `packages/react/src/components/Label/Label.tsx`; add per-story descriptions on `packages/react/src/components/Label/Label.stories.tsx`.
- [ ] T007 [P] [US1] [US2] Audit SkipLink — restructure existing TSDoc to match 6-section template (no Keyboard interactions subsection), verify per-prop TSDoc on `packages/react/src/components/SkipLink/SkipLink.tsx`; verify/add per-story descriptions on `packages/react/src/components/SkipLink/SkipLink.stories.tsx`.
- [ ] T008 [P] [US1] [US2] Audit VisuallyHidden — restructure existing TSDoc to match 6-section template (no Keyboard interactions subsection), add per-prop TSDoc on `packages/react/src/components/VisuallyHidden/VisuallyHidden.tsx`; verify/add per-story descriptions on `packages/react/src/components/VisuallyHidden/VisuallyHidden.stories.tsx`.

**Checkpoint**: Batch B complete. All 7 single components fully documented.

---

## Phase 4: Per-Component Audit — Batch C (Compound components, sibling exports)

**Goal**: Add structured TSDoc (overview on primary component + per-slot shorter blocks) and per-story descriptions to Card, Dialog, and Tabs. Dialog closes inbox bullets 2-3.

**Independent Test**: Same verification commands. Additionally confirm that hovering individual slot exports (e.g., `<DialogContent>`, `<CardHeader>`) in an IDE surfaces per-slot TSDoc.

- [ ] T009 [P] [US1] [US2] Audit Card — add overview TSDoc (6-section, no Keyboard interactions) on `Card` function + per-slot TSDoc on 6 sibling exports + per-prop TSDoc on `CardProps` in `packages/react/src/components/Card/Card.tsx`; add per-story descriptions on `packages/react/src/components/Card/Card.stories.tsx`.
- [ ] T010 [P] [US1] [US2] Audit Dialog — add overview TSDoc (6-section) on `Dialog` function + per-slot TSDoc on 9 sibling exports + per-prop TSDoc on all prop interfaces in `packages/react/src/components/Dialog/Dialog.tsx`; add per-story descriptions on `packages/react/src/components/Dialog/Dialog.stories.tsx`. Closes inbox bullets 2-3 (TSDoc on `DialogContent.showCloseButton` and `DialogFooter.showCloseButton`).
- [ ] T011 [P] [US1] [US2] Audit Tabs — add overview TSDoc (6-section) on `Tabs` function + per-slot TSDoc on 3 sibling exports + per-prop TSDoc on all prop interfaces in `packages/react/src/components/Tabs/Tabs.tsx`; add per-story descriptions on `packages/react/src/components/Tabs/Tabs.stories.tsx`.

**Checkpoint**: Batch C complete. All sibling-export compounds documented.

---

## Phase 5: Per-Component Audit — Batch D (Compound components, dot notation + mixed)

**Goal**: Add structured TSDoc (overview on object literal + per-slot blocks) and per-story descriptions to SegmentedControl, Select, Slider, and Tooltip. Slider closes inbox bullets 4-5. SegmentedControl closes inbox bullet 6. Tooltip has partial existing TSDoc to restructure.

**Independent Test**: Same verification commands. Confirm overview TSDoc surfaces when hovering the compound object (e.g., `Slider`) and per-slot TSDoc surfaces when hovering slots (e.g., `Slider.Track`).

- [ ] T012 [P] [US1] [US2] Audit SegmentedControl — add overview TSDoc (6-section) on `SegmentedControl` object literal + per-slot TSDoc on `.Root` and `.Item` + per-prop TSDoc on `SegmentedControlRootProps` and `SegmentedControlItemProps` in `packages/react/src/components/SegmentedControl/SegmentedControl.tsx`; remove duplicate argTypes descriptions, add per-story descriptions on `packages/react/src/components/SegmentedControl/SegmentedControl.stories.tsx`. Closes inbox bullet 6.
- [ ] T013 [P] [US1] [US2] Audit Select — add overview TSDoc (6-section) on `Select` function + per-slot TSDoc on 9 sibling exports + per-prop TSDoc on all prop interfaces in `packages/react/src/components/Select/Select.tsx`; add per-story descriptions on `packages/react/src/components/Select/Select.stories.tsx`.
- [ ] T014 [P] [US1] [US2] Audit Slider — add overview TSDoc (6-section) on `Slider` object literal + per-slot TSDoc on `.Root`, `.Control`, `.Track`, `.Indicator`, `.Thumb` + per-prop TSDoc on all 5 prop interfaces in `packages/react/src/components/Slider/Slider.tsx`; remove duplicate argTypes descriptions, add per-story descriptions on `packages/react/src/components/Slider/Slider.stories.tsx`. Closes inbox bullets 4-5.
- [ ] T015 [P] [US1] [US2] Audit Tooltip — restructure existing per-prop TSDoc to match 3-section template, add overview TSDoc (6-section) on `Tooltip` object literal + per-slot TSDoc on `.Provider`, `.Trigger`, `.Content` in `packages/react/src/components/Tooltip/Tooltip.tsx`; remove duplicate argTypes descriptions, add per-story descriptions on `packages/react/src/components/Tooltip/Tooltip.stories.tsx`.

**Checkpoint**: Batch D complete. All 14 components fully documented.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Close the inbox, ship changesets, run final verification.

- [ ] T016 [US1] Update `specs/006-sidecar-retrofit/spec-007-inbox.md` — strike through all 6 bullets with references to the resolving commits
- [ ] T017 Create `.changeset/` file(s) declaring `@unbranded-ds/react: patch` with audit summary message
- [ ] T018 Final verification — run full CI-equivalent suite: `pnpm typecheck && pnpm exec tsx scripts/validate-sidecars.ts && pnpm test:unit && pnpm --filter @unbranded-ds/storybook build`

**Checkpoint**: All tasks complete. Branch ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — start immediately
- **Phases 2-5 (Per-component batches)**: Can start immediately in parallel with Phase 1. The validator (T001) blocks the final CI-green check but not the writing itself.
- **Phase 6 (Polish)**: Depends on all component tasks (T002-T015) being complete.

### User Story Dependencies

- **US1 (TSDoc)** and **US2 (Story descriptions)** are combined per component task. Within each task, write TSDoc first (so you know what argTypes to remove), then add story descriptions.
- All 14 component tasks are independent of each other — they touch disjoint file pairs.

### Parallel Opportunities

**Maximum parallelism**: T001 + T002 + T003 + T004 + T005 + T006 + T007 + T008 + T009 + T010 + T011 + T012 + T013 + T014 + T015 can ALL run concurrently. Each touches a unique pair of files.

**Practical parallelism (subagent batches)**: dispatch 4-5 agents, each handling one batch:

- Agent 1: T001 (validator)
- Agent 2: T002-T005 (Batch A)
- Agent 3: T006-T008 (Batch B)
- Agent 4: T009-T011 (Batch C)
- Agent 5: T012-T015 (Batch D)

---

## Parallel Example: Full Dispatch

```bash
# All component tasks are independent — launch by batch:
Agent 1: "Extend validate-sidecars.ts for TSDoc @example extraction"
Agent 2: "Audit Button, Checkbox, Input, Switch — TSDoc + story descriptions"
Agent 3: "Audit Label, SkipLink, VisuallyHidden — TSDoc + story descriptions"
Agent 4: "Audit Card, Dialog, Tabs — TSDoc + story descriptions (compound, sibling)"
Agent 5: "Audit SegmentedControl, Select, Slider, Tooltip — TSDoc + story descriptions (compound, dot notation)"
```

---

## Implementation Strategy

### MVP First (US1 TSDoc is the value driver)

1. Complete T001 (validator extension) — CI safety net
2. Complete any single component (e.g., T002 Button) — validate the TSDoc template renders correctly in IDE hover and Storybook autodoc
3. Confirm react-docgen propagation works as expected before bulk-running remaining components
4. **STOP and VALIDATE**: Open Storybook, hover in IDE, check Controls panel

### Full Delivery

1. Validate on one component (above)
2. Dispatch remaining 13 components in parallel batches
3. Close inbox (T016), create changeset (T017), final verification (T018)
4. PR

### Reference Files Per Task

Each component task should reference:

- **Sidecar** (intent reference): `packages/react/src/components/<Component>/<Component>.usage.md`
- **Component template**: `specs/007-autodoc-audit/contracts/component-tsdoc-template.md`
- **Prop template**: `specs/007-autodoc-audit/contracts/prop-tsdoc-template.md`
- **FR-003 bar**: in prop template (WHAT + WHEN examples and anti-patterns)
- **APG URL**: see `specs/007-autodoc-audit/research.md` table

---

## Notes

- All prose must pass humanizer review (Section XI.1). No AI tells.
- Three-item prose lists restructured. Code unions exempt.
- `{@link ComponentName}` for all sibling cross-references (FR-020).
- TSDoc must be declaration-attached (FR-021). No floating blocks.
- `@example` blocks must compile (FR-019). Use the same import style as sidecars.
- Keyboard table only for: Button, Checkbox, Dialog, SegmentedControl, Select, Slider, Switch, Tabs, Tooltip.
- No keyboard table for: Card, Input, Label, SkipLink, VisuallyHidden.
- APG `@see` only for 10 components with a matching pattern. Omit for Card, Input, Label, VisuallyHidden. SkipLink gets a WCAG 2.4.1 reference instead of APG.
