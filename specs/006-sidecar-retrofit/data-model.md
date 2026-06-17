# Data Model: Sidecar retrofit

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Date**: 2026-05-18

## Scope

This spec produces files, not data structures. The "data model" is the set of file entities the spec creates or appends to, the fields each carries, the validation rules that apply, and how the entities relate.

## Entities

### Single-component sidecar

A `<Component>.usage.md` file co-located with a single-component source.

**Filesystem location**: `packages/react/src/components/<Component>/<Component>.usage.md` where `<Component>` is one of: `Button`, `Checkbox`, `Input`, `Label`, `SkipLink`, `Switch`, `VisuallyHidden`.

**Required sections** (in order, per spec 005's sidecar-shape contract):

| Section            | Content                                                                                                                               | Validation                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Heading + tagline  | `# <Component>` followed by a one-line role tagline                                                                                   | Markdown H1                                                                           |
| When to use        | One paragraph describing the consumer scenario the component addresses                                                                | Active voice, no promotional language, no AI tells                                    |
| Import             | One `tsx` code block showing the import statement                                                                                     | Compile-validated by CI validator                                                     |
| Props              | One flat table with columns `Prop`, `Type`, `Default`, `Description`                                                                  | `Type` from TS signature; `Default` from destructuring default; `argTypes` derivative |
| Common patterns    | One or more `tsx` blocks tagged for compilation, each preceded by a one-paragraph use-case explanation                                | Compile-validated; multi-component examples allowed                                   |
| Accessibility      | Plain-prose narrative covering keyboard interaction, screen-reader announcements, ARIA roles, focus management                        | Names specific keys and behaviors                                                     |
| Variants and slots | Lists CVA variant axes with values and defaults; for components with neither, the canonical placeholder text from spec 005's contract | —                                                                                     |
| Related            | Bulleted list of sibling components or related primitives, each with a one-line "why you'd reach for it" note                         | Forward-only on per-PR pass; omitted when nothing relates                             |

**Validation rules**:

- All `tsx` code blocks compile via `tsc --noEmit` through `scripts/validate-sidecars.ts`
- Prose passes humanizer review per FR-006
- No three-item lists in prose per FR-016 (code lists in `'a' | 'b' | 'c'` form are exempt)
- Prop table agrees with the component's code per FR-003 source-of-truth rule
- Common patterns agree with the component's stories per FR-004

**Count**: 7 instances (one per single-component type).

### Compound-component sidecar

A `<Component>.usage.md` file co-located with a compound-component source.

**Filesystem location**: `packages/react/src/components/<Component>/<Component>.usage.md` where `<Component>` is one of: `Card`, `Dialog`, `SegmentedControl`, `Select`, `Slider`, `Tabs`, `Tooltip`.

**Required sections**: Same as single-component sidecar, with one structural difference: the Props section is split into per-slot subsections, one per named export the component exposes.

**Per-slot Props subsection**:

| Slot category                                               | Subsection format                                                                                                                | Length                        |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Core slot (e.g., `Dialog.Content`, `Tabs.List`)             | Full prop table with `Prop`/`Type`/`Default`/`Description` columns                                                               | Proportional to props surface |
| Escape-hatch slot (e.g., `Dialog.Portal`, `Dialog.Overlay`) | One-line subsection: "Inherits all props from [underlying primitive]. Reach for this only when you need to [override scenario]." | One line, no table            |

**Variants and slots section**: For compound sidecars, names every slot the component exposes with a one-line role description.

**Validation rules**: Same as single-component sidecar, plus FR-011a (no named export silently omitted).

**Count**: 7 instances (one per compound-component type).

### Per-component changeset

A `.changeset/add-<component>-sidecar.md` file declaring the version bump for one component's sidecar PR.

**Filesystem location**: `.changeset/add-<component-kebab>-sidecar.md` (e.g., `.changeset/add-button-sidecar.md`, `.changeset/add-segmented-control-sidecar.md`).

**Schema**: Standard Changesets format —

```markdown
---
'@unbranded-ds/react': patch
---

Add usage sidecar for <Component>.
```

**Validation rules**:

- One package declared: `@unbranded-ds/react`
- Bump level: `patch` (sidecar-only changes are documentation, not behavior or API)
- Summary line names the component

**Count**: 14 instances (one per per-component PR). Aggregates into a single release bump on the next `changesets/action` release PR.

### Backfill changeset

A `.changeset/sidecar-related-backfill.md` file declaring the version bump for the final backfill PR.

**Filesystem location**: `.changeset/sidecar-related-backfill.md`.

**Schema**: Same as per-component changeset, with the summary line naming the backfill scope:

```markdown
---
'@unbranded-ds/react': patch
---

Backfill inter-sidecar Related links after the per-component cohort completes.
```

**Count**: 1 instance.

### Spec 007 inbox

A running list of TSDoc/JSDoc drift sites discovered while authoring sidecars. Created by the first sidecar PR that observes drift, appended by every subsequent PR that observes more.

**Filesystem location**: `specs/006-sidecar-retrofit/spec-007-inbox.md`.

**Schema**: A markdown document with bullets of the form:

```markdown
- `packages/react/src/components/<Component>/<Component>.tsx:<line-range>` — <one-line description of the drift>. Observed while authoring `<Component>.usage.md`.
```

**Validation rules**:

- File ships on the per-component PR that observed the drift; not a separate cleanup PR
- One bullet per drift site
- File path and line range are concrete (not "around here")

**Count**: 1 instance; populated incrementally across the cohort. Spec 007 consumes it as a starting backlog and removes entries as it addresses them.

## Relationships

```text
Single-component sidecar (×7) ─── one-to-one ───→ component source
                                                       │
                                                       └─→ stories source (cross-checked per FR-004)

Compound-component sidecar (×7) ── one-to-one ──→ component source (with multi-export surface)
                                                       │
                                                       └─→ stories source (cross-checked per FR-004)

Per-component changeset (×14) ──── one-to-one ──→ Per-component PR ──→ Sidecar file
                                                       │
                                                       │                     (Both land or neither lands.)
                                                       │
                                                       └─→ Optional: spec-007-inbox.md append

Backfill changeset (×1) ────────── one-to-one ──→ Backfill PR ──→ All 14 sidecars' Related sections

All 15 changesets ──────────────── aggregate ────→ One release bump (next `changesets/action` PR)
                                                       │
                                                       └─→ CHANGELOG entry lists each component by name
```

## Lifecycle

1. **Per-component PR opens**: Author copies the template, writes the sidecar, adds the changeset, optionally appends to the inbox. Runs `pnpm exec tsx scripts/validate-sidecars.ts` locally before pushing.
2. **CI verifies**: Validator runs against the new sidecar's `tsx` blocks. Other CI gates run on the unchanged `.tsx` source.
3. **Review**: Reviewer cross-checks the prop table against `<Component>.tsx` per FR-003. Cross-checks Common patterns against `<Component>.stories.tsx` per FR-004. Runs prose through humanizer per FR-006. Verifies no three-item lists per FR-016.
4. **Merge**: Sidecar lands on `main`. The corresponding `AGENTS.md` index link now resolves. Other sidecars' Related sections may still not link to this one (forward-only per FR-008); the backfill PR will fix that.
5. **Cohort completes**: All 14 per-component PRs merged.
6. **Backfill PR opens**: Author edits every existing sidecar's Related section to reach all relevant peers. Adds the backfill changeset.
7. **Release**: The next `changesets/action`-generated release PR aggregates all 15 changesets into one patch bump (e.g., 0.3.0 → 0.3.1) with a CHANGELOG that lists each sidecar PR's component name.

## What this data model does NOT cover

- The component source itself — no modifications per FR-015 + FR-015a
- The sidecar-shape contract — defined in spec 005, amended only as documented in `contracts/sidecar-shape-amendments.md`
- Generated component-metadata schemas — auto-generation explicitly out of scope
- Storybook docs integration — deferred to a future spec
