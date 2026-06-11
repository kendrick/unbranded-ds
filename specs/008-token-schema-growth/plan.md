# Implementation Plan: Token schema growth

**Branch**: `008-token-schema-growth` | **Date**: 2026-05-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-token-schema-growth/spec.md`

## Summary

Grow the canonical `@unbranded-ds/tokens` schema with the for-coleman additions (required: `font-serif`, a `motion` category, `size-2xl`/`size-3xl`) plus two optional drift-killing tokens (`ring.width`, a `z-index` scale). Loosen theme validation so a runtime theme can override any category, with validation running against the resolved (merged) theme rather than the raw fragment. Document the two distinct "theme" concepts in THEMING.md with a worked example of each. Ship as `@unbranded-ds/tokens@0.4.0` with a coordinated `@unbranded-ds/react` patch.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any`
**Primary Dependencies**: Style Dictionary v4 (DTCG build), Zod (theme schema + validation), Tailwind CSS v4 (`@theme` preset consumption)
**Storage**: Filesystem only. DTCG source files under `packages/tokens/src/tokens/`, built-in theme files under `packages/tokens/themes/`, generated artifacts under `packages/tokens/dist/`.
**Testing**: Vitest (`packages/tokens` unit + fixture tests for schema/validate/runtime/color)
**Target Platform**: npm package consumed in browser + SSR build pipelines
**Project Type**: monorepo library (the `@unbranded-ds/tokens` package; `@unbranded-ds/react` takes a coordinated dependency bump)
**Performance Goals**: N/A (build-time token generation + a runtime validation function)
**Constraints**: Adding required tokens is a breaking change to consumer runtime themes (pre-1.0, communicated by the minor bump). DTCG source authoring per Constitution Section II. Validator output stays structured per Section XI.4.
**Scale/Scope**: One new token category (motion), three new typography keys, two optional token additions (ring, z-index), a validator refactor (resolve-then-validate at two call sites), one build-config extension, three doc additions, one brand theme enrichment.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Section I (Repository shape)** — no new package. All work in the existing `packages/tokens`; `packages/react` takes a dependency bump only.
- [x] **Section II (Tokens independent of components)** — new tokens authored in DTCG (`$value`/`$type`), compiled by Style Dictionary to the four artifacts. No React/Storybook in the tokens dependency graph.
- [x] **Section III (Theming contract: schema locked, values float)** — this spec extends the locked schema (adds names) and broadens which categories float at runtime. It does not change the "names fixed at build, values float" model. Section III's "values float" applies to every category, which is exactly the gap US2 closes.
- [x] **Section VIII (Tooling baseline)** — no toolchain changes. Style Dictionary, Zod, Tailwind v4, Changesets all already in place.
- [x] **Section X (Governance / changeset)** — the PR ships a `@unbranded-ds/tokens` minor changeset; `@unbranded-ds/react` patch follows automatically via the changeset config's `updateInternalDependencies: "patch"`.
- [x] **Section XI (Agent + human legibility)** — THEMING.md prose runs through the humanizer before merge (XI.1); the token vocabulary stays predictable (XI.2); the new docs name the two theme concepts so neither audience has to guess which format a file uses (XI.3); validator errors stay structured `{ ok, issues: [{ code, path, message }] }` (XI.4). No components added, so the per-component sidecar rule does not apply.

No violations. No concessions.

## Project Structure

### Documentation (this feature)

```text
specs/008-token-schema-growth/
├── plan.md              # This file
├── research.md          # Phase 0 output (Tailwind namespaces, merge model, type decisions)
├── data-model.md        # Phase 1 output (token categories, the two theme formats, merge semantics)
├── quickstart.md        # Phase 1 output (implement + verify walkthrough)
├── contracts/
│   ├── token-schema.md        # The expanded token vocabulary + DTCG types
│   └── validate-theme.md      # validateTheme/registerTheme resolve-then-validate contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/tokens/
├── src/
│   ├── tokens/
│   │   ├── motion.json          # NEW — durations + easings (DTCG)
│   │   ├── typography.json      # EDIT — add font-serif, size-2xl, size-3xl
│   │   ├── ring.json            # NEW — optional ring.width default
│   │   ├── z-index.json         # NEW — optional layering scale defaults
│   │   ├── color.json spacing.json radii.json shadows.json opacity.json  # unchanged
│   ├── schema.ts                # EDIT — add motionTokens (required), typography keys (required),
│   │                            #         ring + z-index (optional); export defaults for the merge
│   ├── validate.ts              # EDIT — resolve (merge onto defaults) then validate; fix the skip
│   ├── runtime.ts               # EDIT — same resolve-then-validate in registerTheme's contrast check
│   ├── color.ts                 # unchanged (contrast math reused)
│   └── __fixtures__/            # ADD partial-theme + inherited-pair fixtures
├── themes/
│   ├── brand.json               # EDIT — add radius + typography override (Q3: multi-category demo)
│   ├── light.json dark.json     # unchanged (stay color-only)
├── sd.config.ts                 # EDIT — TS category map + motion var-naming special case
└── (dist/ regenerated by build)

THEMING.md                       # EDIT — Extending-the-schema, Overriding-non-color, two-formats distinction
.changeset/<name>.md             # NEW — @unbranded-ds/tokens: minor
```

**Structure Decision**: All implementation lives in `packages/tokens` plus the root `THEMING.md`. The `@unbranded-ds/react` package is untouched in source; it only receives an automatic patch bump from Changesets.

## Parallelization

The user asked what's parallelizable. Spec 008 is one package with a build pipeline, so it's less embarrassingly parallel than spec 007's 14-component fan-out — but there are two genuinely independent tracks plus dependent convergence:

**Track A — Token additions (independent).** Author the DTCG sources (`motion.json`, `ring.json`, `z-index.json`, typography edits) and extend the Zod schema (motion required; typography keys required; ring/z-index optional). Self-contained: it's "what tokens exist."

**Track B — Validator resolve-then-validate (independent).** Refactor `validate.ts` and `runtime.ts` to merge a partial theme onto the canonical defaults before checking completeness and contrast, fixing the `if (!fg || !bg) continue` skip at both sites. This depends on the *mechanism*, not on Track A's specific tokens, so it runs concurrently.

**Then converge (depend on A):**
- **Track C — Build wiring**: `sd.config.ts` — extend the TS `categoryMap` + `TokenCategory` union for the new categories, and special-case the motion category's CSS-var naming (`--ease-*` / `--duration-*`).
- **Track D — Themes**: enrich `brand.json` with the multi-category override (radius + typography); confirm the resolved build output of all three themes carries the new required tokens via inheritance.

**Then serialize:**
- **Track E — Docs** (THEMING.md): depends on A–D being settled; the three additions (extend-schema walkthrough, override-non-color subsection, two-formats distinction). Prose drafts can start early but verify last. Runs through the humanizer before merge.
- **Track F — Release**: the tokens minor changeset; react patch is automatic.

So: **A ∥ B**, then **C ∥ D**, then **E**, then **F**. Two-up at the front and the middle; docs and release are the serial tail. The validator track (B) is the cleanest thing to hand to a separate worker since it shares no files with the token-addition work.

## Research Summary

See [research.md](research.md). Key resolved decisions:

- **Tailwind v4 has no `--duration-*` namespace** (confirmed against the v4 namespace list). Easings emit as `--ease-*` and generate real `ease-standard` utilities; durations emit as plain `--duration-*` CSS vars consumed via `duration-[var(--duration-base)]` or `transition-duration: var(...)`. The three easing values equal Tailwind's default `ease-in`/`out`/`in-out` curves, renamed semantically.
- **New typography keys follow the existing `--typography-*` convention** (consistency with `font-sans`/`size-sm` siblings). Aligning the whole typography category to Tailwind's `--text-*`/`--font-*` namespaces is a separate, larger concern, out of scope.
- **Resolve-then-validate** merges a partial theme onto the bundled default token map, then runs the existing completeness + contrast logic on the merged result. The defaults already exist as a build artifact; no new data source.
- **react patch is automatic** via `updateInternalDependencies: "patch"` in `.changeset/config.json`.

## Complexity Tracking

> No constitution violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
