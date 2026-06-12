# Implementation Plan: Resolution unification (single source of resolution truth)

**Branch**: `014-resolution-unification` | **Date**: 2026-06-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/014-resolution-unification/spec.md`

## Summary

Collapse the two resolution engines 009 left behind. Style Dictionary already resolves each bundled theme for the CSS; have it **also emit each theme's resolved delta as data**, generate the defaults baseline from its resolved base, and repoint the MCP and the bundled-theme validation at that emitted data instead of re-resolving. Once a bundled theme is resolved by exactly one engine, the cross-surface parity matrix and the canonical-defaults drift guard are no longer load-bearing: the matrix becomes a thin read-the-artifact canary, the drift guard becomes a regenerate-and-diff check, and `dtcgToResolved` (whose only purpose was the MCP's second resolution path) is deleted. No consumer-facing theming behavior changes; the win is structural, not feature.

The delta is the load-bearing decision (clarify Q1): the artifact is each theme's *overrides*, build-resolved, so `composeTokens` folds them exactly as in 009 and `defaults ⊕ delta == the CSS full set` by construction. The delta-emission mechanism already exists — 009's density themes emit delta CSS via theme-alone sourcing; 014 reuses it for a JSON sibling across all themes.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any`
**Primary Dependencies**: Style Dictionary v4 (made the single resolver for bundled themes), Zod (schema/validation, unchanged), `@modelcontextprotocol/sdk` (the MCP, repointed)
**Storage**: Filesystem only. New per-theme resolved-delta artifacts and the generated defaults baseline under `packages/tokens/dist/` and `packages/tokens/src/` respectively.
**Testing**: Vitest (unit), the MCP smoke test, a thin parity canary, and a regenerate-and-diff check on the committed baseline. The decisive net is that the unchanged 009 theming + composition tests stay green (proving no behavior change).
**Target Platform**: Token artifacts consumed by the MCP, the validator, and browser/SSR pipelines.
**Project Type**: monorepo tokens package (`packages/tokens`), internal refactor.
**Performance Goals**: N/A (build-time generation).
**Constraints**: No consumer-facing theming change (FR-011). Tokens package keeps zero React/Storybook deps. Style Dictionary stays the pipeline (Section VIII) and becomes more central.
**Scale/Scope**: One package. One foundational build change (emit delta + base), two repoints (MCP, bundled-theme validation), and three deletions/reductions (parity matrix → canary, drift guard → regen check, `dtcgToResolved` removed).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Section I (Repository shape)** — no new package; all work in `packages/tokens`.
- [x] **Section II (Tokens independent of components)** — stays within `@unbranded-ds/tokens`; no React/Storybook enters the graph.
- [⚠] **Section III (Theming contract)** — "Themes are validated; fail loudly" stays true, but the bundled-theme validation entry point moves to read the emitted artifact. This MAY warrant a **patch-level wording clarification** to Section III (no new principle, no behavior change). Flagged in FR-012; the plan confirms whether the current wording needs a touch. The composition contract and public theming API from 009 (now Section III at 1.2.0) are unchanged.
- [x] **Section VI (Testing)** — unit tests carry it; the parity matrix is replaced by a thin canary, the drift guard by a regen check, and the 009 suites remain the regression net. Net test count drops, which is the point.
- [x] **Section VII (MCP surface)** — the MCP repoints to read emitted artifacts; the `tools/list` smoke test and the four tools are unchanged. Values it returns now match the rendered CSS by construction.
- [x] **Section VIII (Tooling baseline)** — Style Dictionary becomes the single resolver for bundled themes; no new tooling, the pipeline is honored more strongly.
- [x] **Section X (Governance / changeset)** — ships a `@unbranded-ds/tokens` **patch** (internal plumbing, no consumer-facing change). The emitted artifact is internal unless exported; treated as non-public.
- [x] **Section XI (Agent + human legibility)** — XI.4 structured failures unchanged. The only prose is the recorded note on each retired test (why it is no longer load-bearing); it passes the humanizer. No API or sidecar churn.

No violations. One possible patch-level Section III wording clarification (tracked, not a blocker).

## Project Structure

### Documentation (this feature)

```text
specs/014-resolution-unification/
├── plan.md              # This file
├── research.md          # Phase 0: the delta-emission mechanism, the defaults generation, the consumer repoints
├── data-model.md        # Phase 1: the resolved-delta artifact + the one resolution flow
├── contracts/
│   └── resolved-artifact.md   # The emitted delta artifact shape + the read contract for consumers
├── quickstart.md        # Phase 1: implement + verify, incl. the regression-net check
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/tokens/
├── sd.config.ts          # emit per-theme resolved-delta JSON (theme-alone source, like 009's density CSS) + the resolved base
├── src/
│   ├── defaults.ts        # becomes a re-export of the generated baseline (or is replaced by it)
│   ├── defaults.generated.ts   # NEW — committed, generated from SD's resolved base
│   ├── defaults.test.ts   # becomes the regenerate-and-diff check (replaces the hand-maintained drift guard)
│   ├── resolve.ts         # remove dtcgToResolved (keep mergeLayer / composeTokens / the branded boundary)
│   ├── resolve.test.ts    # drop the dtcgToResolved cases
│   ├── index.ts           # remove the dtcgToResolved export
│   ├── resolution-parity.test.ts   # reduce the matrix to a thin read-the-artifact canary
│   ├── themes-contrast.test.ts     # bundled-theme contrast reads the artifact (composed) instead of raw DTCG
│   ├── validate.test.ts   # the dtcgToResolved test helper switches to the artifact
│   └── mcp/
│       ├── compose.ts     # read the emitted delta artifact instead of dtcgToResolved(getTheme)
│       └── themes.ts       # may load artifacts alongside (or instead of) raw theme data
.changeset/*.md            # @unbranded-ds/tokens: patch
.specify/memory/constitution.md   # possible patch wording clarification to Section III (confirm in research)
```

**Structure Decision**: All in `packages/tokens`. The one new artifact is the per-theme resolved-delta JSON the build emits; the one new source file is the committed generated defaults baseline. Everything else is a repoint or a deletion.

## Parallelization

This spec is more sequential than 009 — the foundational build change gates the repoints, and the deletions depend on the repoints. The honest shape:

**Step 1 — Foundational (the build emits the data).** In `sd.config.ts`: emit, per theme, a resolved-delta JSON (a new `json` format over a theme-alone source, mirroring the proven density-delta CSS path), and emit the resolved base; generate the committed `defaults.generated.ts` from that base. This is the single change everything downstream reads. It must land first.

**Step 2 — Repoint the consumers (parallel, two disjoint files).** Once the artifacts exist:
- `src/mcp/compose.ts` reads the delta artifact for each axis and folds via `composeTokens`, replacing the `dtcgToResolved(getTheme())` path.
- `src/themes-contrast.test.ts` (the bundled-theme validation) reads the artifact (composed onto defaults) instead of raw DTCG.
These touch different files and can run concurrently.

**Step 3 — Reduce and delete (after the repoints, mostly cleanup).** Reduce `resolution-parity.test.ts` to the thin canary; convert `defaults.test.ts` to the regen-and-diff check; remove `dtcgToResolved` from `resolve.ts` / `index.ts` / `resolve.test.ts` and switch the `validate.test.ts` helper to the artifact. These are coupled to Step 2 landing (no caller left) but are otherwise independent edits.

**Step 4 — Verify.** The 009 theming + composition + MCP suites stay green (the regression net), the canary holds, the regen check passes, and a grep confirms no JS path re-resolves a bundled theme.

So: **foundational build change → two parallel repoints → cleanup deletions → verify.** The parallel width is small (two files); the value here is correctness and subtraction, not fan-out.

## Testing Strategy

The decisive test is the one that *doesn't change*: the full 009 theming, composition, MCP, runtime, and contrast suites must pass **unchanged**, which is what proves "no consumer-facing behavior change" (FR-011, SC-006). On top of that:

- **The thin parity canary** (replacing the matrix): for one representative composition (vaporwave + compact), assert the MCP value equals the emitted-artifact-composed value equals the CSS value, for a sample of tokens. Guards the one residual risk — a consumer reading stale data instead of the artifact.
- **The regenerate-and-diff check** (replacing the drift guard): regenerate the defaults baseline from the resolved base and assert it equals the committed `defaults.generated.ts`. A stale baseline fails CI.
- **A single-engine assertion** (SC-001): confirm `dtcgToResolved` is gone and no JS path re-resolves a bundled source theme (structural / grep-style check, recorded so the absence is intentional, not silent).
- **MCP smoke** (Section VII): `tools/list` still returns the four tools.

What gets *deleted* is as important as what's added: the (combination × token) parity matrix and the hand-maintained drift guard both go, because the invariants they defended are now structural. Each deletion carries a one-line note recording why.

## Research Summary

See [research.md](research.md). Resolved against the 009 code:

- **Delta emission is proven.** 009's density themes already emit delta CSS via theme-alone Style Dictionary sourcing (`dist/css/tokens-compact.css` carries only compact's keys). 014 adds a JSON sibling using the same theme-alone source per theme, so the artifact is each theme's build-resolved delta. Same transforms as the CSS, so `defaults ⊕ delta == CSS full` by construction.
- **The defaults baseline** is Style Dictionary's resolved base (`src/tokens/**`, which after the 009 fix equals the light theme's color). Emit it as a committed `defaults.generated.ts`; `defaults.test.ts` becomes regenerate-and-diff. This removes the build-order risk (a committed source file is present at typecheck/test time) and retires the hand-maintained copy.
- **The MCP repoint** swaps `dtcgToResolved(getTheme())` in `compose.ts` for a read of the delta artifact, then the same `composeTokens` fold. The branded `ResolvedTokens` boundary stays and keeps the runtime resolver honest.
- **`dtcgToResolved` has no production caller** after the repoint (only test helpers and the deleted parity matrix used it), so it is removed.
- **Section III wording**: the validation entry point moving to the artifact is a behavior-preserving plumbing change; research confirms whether the current Section III text references the old path closely enough to warrant a patch clarification.

## Complexity Tracking

> No constitution violations. The possible Section III wording touch is a tracked patch clarification, not a violation.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
