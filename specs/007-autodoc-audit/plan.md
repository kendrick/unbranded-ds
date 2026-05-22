# Implementation Plan: Autodoc legibility audit

**Branch**: `007-autodoc-audit` | **Date**: 2026-05-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-autodoc-audit/spec.md`

## Summary

Apply the humanizer-clean voice and structured TSDoc templates (6-section component-level, 3-section prop-level) to all 14 shipped components. One source edit reaches three consumer surfaces: IDE hover, Storybook autodoc banner, and Controls panel. Close the six spec-006 inbox bullets. Add per-story descriptions to every named story. Extend the sidecar validator to compile-check TSDoc `@example` blocks.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any`
**Primary Dependencies**: `@base-ui-components/react`, `class-variance-authority`, Storybook 10.3 (`@storybook/react-vite`), react-docgen (Storybook-bundled)
**Storage**: N/A (prose-only edits to existing source files)
**Testing**: Vitest (unit), Storybook test-runner (interaction + a11y), `scripts/validate-sidecars.ts` (compile validation)
**Target Platform**: npm package consumed in browser + SSR environments
**Project Type**: component library (monorepo)
**Performance Goals**: N/A (no runtime changes)
**Constraints**: prose-only — no behavior or API changes (FR-013). TSDoc must be declaration-attached (FR-021). `@example` blocks must compile via `tsc --noEmit` (FR-019).
**Scale/Scope**: 14 components × 4 prose surfaces + validator extension

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] Section IV — no component behavior changes, no API changes, no new styling. Prose-only.
- [x] Section V — stories remain co-located, autodocs stay enabled, `argTypes` descriptions shift to TSDoc-as-canonical per FR-008.
- [x] Section VI — test suite unchanged. No new test layers. Existing tests must stay green (FR-014).
- [x] Section VIII — no toolchain changes. Validator extension uses existing `tsx` + `tsc` toolchain.
- [x] Section IX — Definition of Done items preserved. Autodocs render with prop descriptions (item 7) — this spec improves that surface. SSR safety (item 6) unaffected by prose edits.
- [x] Section X — each PR ships a `.changeset/*.md` declaring `@unbranded-ds/react: patch`.
- [x] Section XI — this spec IS the Section XI compliance pass. Prose surfaces get humanizer-clean voice (XI.1). API shape untouched (XI.2). Documentation surfaces gain structured TSDoc that propagates to all three consumer surfaces (XI.3). No failure-mode changes (XI.4). Story coverage unchanged (XI.5).

No violations. No concessions needed.

## Project Structure

### Documentation (this feature)

```text
specs/007-autodoc-audit/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── component-tsdoc-template.md
│   └── prop-tsdoc-template.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/react/src/components/
├── Button/Button.tsx              # TSDoc added
├── Button/Button.stories.tsx      # story descriptions added, duplicate argTypes removed
├── Card/Card.tsx                  # TSDoc added (compound: 7 sibling exports)
├── Card/Card.stories.tsx
├── Checkbox/Checkbox.tsx          # TSDoc added
├── Checkbox/Checkbox.stories.tsx
├── Dialog/Dialog.tsx              # TSDoc added (compound: 10 sibling exports), inbox bullets 2-3
├── Dialog/Dialog.stories.tsx
├── Input/Input.tsx                # TSDoc added
├── Input/Input.stories.tsx
├── Label/Label.tsx                # TSDoc added
├── Label/Label.stories.tsx
├── SegmentedControl/SegmentedControl.tsx   # TSDoc added (compound: dot notation), inbox bullet 6
├── SegmentedControl/SegmentedControl.stories.tsx
├── Select/Select.tsx              # TSDoc added (compound: 10 sibling exports)
├── Select/Select.stories.tsx
├── SkipLink/SkipLink.tsx          # TSDoc updated (existing, needs template alignment)
├── SkipLink/SkipLink.stories.tsx
├── Slider/Slider.tsx              # TSDoc added (compound: dot notation), inbox bullets 4-5
├── Slider/Slider.stories.tsx
├── Switch/Switch.tsx              # TSDoc added
├── Switch/Switch.stories.tsx
├── Tabs/Tabs.tsx                  # TSDoc added (compound: 4 sibling exports)
├── Tabs/Tabs.stories.tsx
├── Tooltip/Tooltip.tsx            # TSDoc updated (partial existing, needs template alignment)
├── Tooltip/Tooltip.stories.tsx
├── VisuallyHidden/VisuallyHidden.tsx   # TSDoc updated (partial existing, needs template alignment)
├── VisuallyHidden/VisuallyHidden.stories.tsx

scripts/
└── validate-sidecars.ts           # Extended to extract + compile TSDoc @example blocks
```

**Structure Decision**: All edits land in existing files. No new source files created. The validator is an extension of the existing script, not a separate file.

## Parallelization Strategy

The user requested maximum parallelization. The work decomposes into three independent axes:

1. **Validator extension** (FR-019) — single task, no component dependency. Should land first so CI catches broken `@example` blocks as component work proceeds.

2. **Per-component audit** (US1 + US2 combined per component) — all 14 components are fully independent of each other. Each component's `.tsx` and `.stories.tsx` edits touch disjoint files. Batch into parallel groups of 3-4 components per agent, grouped by shape:
   - **Batch A (single components, no existing TSDoc)**: Button, Checkbox, Input, Switch
   - **Batch B (single components, existing TSDoc or simple)**: Label, SkipLink, VisuallyHidden
   - **Batch C (compound, sibling exports)**: Card, Dialog, Tabs
   - **Batch D (compound, dot notation + sibling)**: SegmentedControl, Select, Slider, Tooltip

3. **Inbox bullet closure** — folded into the per-component work (bullets map to specific components): Button (bullet 1), Dialog (bullets 2-3), Slider (bullets 4-5), SegmentedControl (bullet 6). All in batches A, C, or D.

4. **Changeset files + inbox cleanup** — final pass after all components are done. One changeset per PR (FR-015).

Batches A-D can run concurrently. The validator can run concurrently with all batches.

## Research Summary

See [research.md](research.md) for full findings. Key decisions:

- **react-docgen propagation confirmed**: Storybook 10.3's react-docgen extracts TSDoc from component functions and prop interfaces, rendering it as the autodoc banner and Controls panel descriptions. Markdown subsections, tables, and code blocks render correctly in the Storybook docs addon.
- **APG pattern coverage**: 10 of 14 components have a direct WAI-ARIA APG pattern URL. Card, Input, Label, and VisuallyHidden have no matching APG pattern — FR-016's "relevant" qualifier means the `@see` line is omitted for these, not fabricated.
- **Validator extension approach**: extend `extractTsxBlocks` to also walk `.tsx` source files and pull `@example` code from TSDoc comments. Same `wrapBlock` + `tsc --noEmit` pipeline. No new dependencies.

## Complexity Tracking

> No constitution violations to justify. Table intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| —         | —          | —                                    |
