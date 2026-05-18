# Implementation Plan: Sidecar retrofit

**Branch**: `006-sidecar-retrofit` | **Date**: 2026-05-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-sidecar-retrofit/spec.md`

## Summary

Author a `<Component>.usage.md` sidecar for every shipped component in `packages/react/src/components/` (14 in total). Each sidecar follows the structure ratified by spec 005's [sidecar-shape contract](../005-agent-experience-foundation/contracts/sidecar-shape.md) and passes the existing CI validator (`scripts/validate-sidecars.ts`). The work splits cleanly along a structural axis: US1 ships sidecars for the seven single-component shapes (one file, flat prop table); US2 ships sidecars for the seven compound-component shapes (one file at top level with per-slot Props subsections). A final "Related backfill" PR populates inter-sidecar links once every peer exists on `main`. Total PR count: 15. No `.tsx` source changes — TSDoc drift gets queued for spec 007 via a running inbox file.

## Technical Context

**Language/Version**: TypeScript 5.x in `tsx`-tagged code blocks only (validated via `tsc --noEmit` per spec 005's compile validator). Sidecar prose is plain CommonMark.
**Primary Dependencies**: All shipped in spec 005. The template at `packages/react/src/components/_template/Component.usage.md`, the validator at `scripts/validate-sidecars.ts`, the `AGENTS.md` component index, and the CI step that wires the validator into the verify job.
**Storage**: Filesystem only. 14 `<Component>.usage.md` files co-located with their `.tsx` source. One running inbox file: `specs/006-sidecar-retrofit/spec-007-inbox.md`. 15 `.changeset/*.md` files (14 component + 1 backfill).
**Testing**: Existing CI validator runs on every PR. Manual review verifies prop tables match the component code per the source-of-truth rule (TS signature → `Type`; destructuring default → `Default`; `argTypes` derivative).
**Target Platform**: N/A — documentation-only artifacts. Sidecars are read locally; rendering inside Storybook is explicitly out of scope.
**Project Type**: Documentation retrofit inside the existing monorepo (no new packages, no new tooling).
**Performance Goals**: N/A.
**Constraints**: This spec MUST NOT modify any `.tsx` source file. Three-item lists are forbidden in prose per Section XI.1 (code lists like `'sm' | 'md' | 'lg'` are exempt). Per-PR Related links may only point at peers already merged to `main`. Compound sidecars must contain a Props subsection for every named export, length proportional to consumer reach.
**Scale/Scope**: 14 components → 14 sidecars → 15 PRs (14 per-component + 1 backfill). Each sidecar lands at 60-150 lines of prose plus code blocks per SC-006's heuristic.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This spec is the per-component manifestation of Section XI.3 — sidecars are a co-equal documentation surface, not a fallback. The gate questions:

- [X] **Section I — Repository shape**: No new packages. Sidecars live inside `packages/react/src/components/` next to existing source.
- [X] **Section II — Tokens independent of components**: Not touched. No tokens-package changes.
- [X] **Section III — Theming contract**: Not touched. Sidecars may reference theming concepts in prose but no schema or runtime changes.
- [X] **Section IV — Components thin and unopinionated**: Not touched. No component source modifications per FR-015 + FR-015a.
- [X] **Section V — Stories are the source of truth**: Honored as the source for usage patterns per FR-004. Stories drive what the sidecar's Common patterns section demonstrates.
- [X] **Section VI — Testing layers**: Existing CI validator covers `tsx` block compile. No new test infrastructure needed.
- [X] **Section VII — Deployment and MCP**: Not touched. Storybook + token-query MCP endpoints unchanged.
- [X] **Section VIII — Tooling baseline**: No new tools. Uses existing tsx + tsc + the validator from spec 005.
- [X] **Section IX — Definition of done for components**: Sidecars are added as a documentation supplement, not a replacement for autodocs (Section IX bullet 7). DoD for shipping a component is unchanged.
- [X] **Section X — Governance + changesets**: Each PR ships a changeset per FR-013. The repo's existing `changeset-check.yml` enforces the rule.
- [X] **Section XI — Agent and human legibility are co-equal**: this spec exists to fully satisfy XI.3 ("an agent or human with a local clone can answer 'how do I use Button' with no network connection"). Prose passes through the humanizer per XI.1 + FR-006. API consistency is reflected in the sidecars but not enforced beyond what spec 010 will retrofit. Documentation surfaces are now complete across all 14 shipped components. Failure modes (the CI validator) produce structured compile output. Story coverage stays the contract per XI.5 — sidecars mirror what stories already exercise.

No concessions. Gate passes pre-Phase 0.

**Post-Phase 1 re-check**: The Phase 1 artifacts (data-model.md, contracts/sidecar-shape-amendments.md, quickstart.md) introduce no new constitution surfaces. The amendments narrow spec 005's contract without changing what the contract requires of a conforming sidecar. The quickstart codifies the existing `humanizer` + `tsc --noEmit` + changeset-presence checks already enforced elsewhere. All gates remain satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/006-sidecar-retrofit/
├── plan.md              # This file
├── spec.md              # Feature spec (clarified)
├── research.md          # Phase 0 — captures clarify decisions in research format
├── data-model.md        # Phase 1 — sidecar entities and relationships
├── quickstart.md        # Phase 1 — author guide for sidecar implementers
├── spec-007-inbox.md    # Created by first PR; appended by each subsequent PR
├── contracts/
│   └── sidecar-shape-amendments.md  # Phase 1 — delta from spec 005's contract
├── checklists/
│   └── requirements.md  # Spec quality checklist (from specify)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source code (repository root)

```text
packages/react/src/components/
├── _template/
│   └── Component.usage.md          # canonical reference (shipped in spec 005)
├── Button/
│   ├── Button.tsx
│   ├── Button.stories.tsx
│   ├── Button.test.tsx
│   ├── Button.usage.md             # ← US1, this spec
│   └── index.ts
├── Card/
│   ├── Card.tsx
│   ├── Card.stories.tsx
│   ├── Card.test.tsx
│   ├── Card.usage.md               # ← US2, this spec (compound)
│   └── index.ts
├── Checkbox/
│   ├── ...
│   └── Checkbox.usage.md           # ← US1
├── Dialog/
│   └── Dialog.usage.md             # ← US2
├── Input/
│   └── Input.usage.md              # ← US1
├── Label/
│   └── Label.usage.md              # ← US1
├── SegmentedControl/
│   └── SegmentedControl.usage.md   # ← US2
├── Select/
│   └── Select.usage.md             # ← US2
├── SkipLink/
│   └── SkipLink.usage.md           # ← US1
├── Slider/
│   └── Slider.usage.md             # ← US2
├── Switch/
│   └── Switch.usage.md             # ← US1
├── Tabs/
│   └── Tabs.usage.md               # ← US2
├── Tooltip/
│   └── Tooltip.usage.md            # ← US2
└── VisuallyHidden/
    └── VisuallyHidden.usage.md     # ← US1

.changeset/
├── add-button-sidecar.md           # ← per-PR
├── add-card-sidecar.md
├── ...                             # 14 component changesets total
└── sidecar-related-backfill.md     # ← final backfill PR
```

**Structure Decision**: Single-package documentation retrofit within `packages/react/`. No directory restructure, no new tooling layout. The 15 PRs each touch:

1. One `<Component>.usage.md` (created) — or, for the backfill PR, edits to every sidecar's Related section.
2. One `.changeset/add-<component>-sidecar.md` (created) — or `.changeset/sidecar-related-backfill.md` for the backfill.
3. Optional: an append to `specs/006-sidecar-retrofit/spec-007-inbox.md` if the author noticed TSDoc drift while reading the component source.

## Complexity Tracking

No constitution violations. Section omitted intentionally per template guidance.
