# Tasks: Resolution unification (single source of resolution truth)

**Input**: Design documents from `/specs/014-resolution-unification/`
**Prerequisites**: plan.md, spec.md, research.md (6 decisions), data-model.md, contracts/

**Tests**: Required. The decisive net is that the **unchanged 009 suites pass unchanged** (proving no behavior change); on top of that, a thin parity canary, a regenerate-and-diff check, and a single-engine assertion. Tests are embedded per story.

**Organization**: By user story, with the build-emit change as a Foundational phase because every story reads it. This is a sequential subtraction spec — the foundational change gates the repoints, and the deletions follow the repoints — so the parallel width is small (two repoint files, two retirement files). All paths are under `packages/tokens/` unless noted.

## Format: `[ID] [P?] [Story] Description`

- **[P]** = parallelizable: a different file with no dependency on an incomplete task.

---

## Phase 1: Setup

- [X] T001 Confirm baseline green: `pnpm --filter @unbranded-ds/tokens test && pnpm --filter @unbranded-ds/tokens build && pnpm typecheck`. Record the current tokens test count as the regression net (the suite must stay green and behavior-identical through this spec).

---

## Phase 2: Foundational (the build emits the data — BLOCKS every story)

**⚠️ Everything downstream reads these artifacts. Both tasks must land before Phase 3.**

- [X] T002 In `sd.config.ts`: emit, per bundled theme, a resolved-delta JSON artifact — a Style Dictionary pass sourced on `themes/<axis>/<name>.json` ALONE (no base `src/tokens/**`), emitting the theme's resolved keys as flat JSON. This mirrors the proven density-delta CSS path (`dist/css/tokens-compact.css` already emits delta-only via theme-alone sourcing). Confirm `defaults ⊕ delta == the theme's full CSS set` for a spot-checked theme.
- [X] T003 In `sd.config.ts` + `src/defaults.generated.ts` (new) + `src/defaults.ts`: emit the resolved base (`src/tokens/**`) and generate a committed `defaults.generated.ts` (a branded `ResolvedTokens`); point `defaults.ts` at it (re-export) or replace it. Confirm the generated baseline equals today's hand-maintained `canonicalDefaultTokens` (behavior-preserving). (After T002 or parallel — different concern, but both edit `sd.config.ts`, so sequence them.)

**Checkpoint**: the build emits per-theme deltas + a generated defaults baseline. The suite still passes.

---

## Phase 3: Bundled themes resolve once (US1)

**Goal**: The MCP and the bundled-theme validation read the emitted artifact instead of re-resolving. A bundled theme is now resolved by exactly one engine.

**Independent Test**: The existing MCP and contrast suites pass unchanged after the repoint (the read works and changes no values), and no JS path re-resolves a bundled theme.

- [X] T004 [P] [US1] In `src/mcp/compose.ts`: read each axis's delta artifact and fold via the existing `composeTokens`, replacing the `dtcgToResolved(getTheme())` path. Keep the branded `ResolvedTokens` boundary. (Depends on T002.)
- [X] T005 [P] [US1] In `src/themes-contrast.test.ts`: read the delta artifact (composed onto the generated defaults) for the bundled-theme contrast check, instead of walking raw DTCG. (Depends on T002/T003.)
- [X] T006 [US1] Confirm the existing MCP tool suite (`src/mcp/tools/*.test.ts`) and the contrast suite pass UNCHANGED after T004/T005 — no value edits. If any test needs a value changed, the refactor altered behavior and is wrong; stop and fix. (After T004/T005.)

**Checkpoint**: bundled-theme values come from the build's emitted data; the 009 surfaces behave identically.

---

## Phase 4: The interim scaffolding retires (US2)

**Goal**: The parity matrix and the drift guard go, because the invariants they defended are now structural.

**Independent Test**: With the single-resolver change landed, removing the matrix and the drift guard leaves the suite green; the thin canary and the regen check hold.

- [X] T007 [P] [US2] In `src/resolution-parity.test.ts`: reduce the `(combination × token)` matrix to a thin canary — for one composition (vaporwave + compact), assert the MCP value equals the artifact-composed value equals the CSS value for a sample of tokens. Add a one-line note recording that the full-matrix invariant is now structural. (Depends on T002 + T004.)
- [X] T008 [P] [US2] In `src/defaults.test.ts`: convert the hand-maintained drift guard to a regenerate-and-diff check — regenerate the baseline from the resolved base and assert it equals the committed `defaults.generated.ts`. (Depends on T003.)

**Checkpoint**: the standing test tax is gone; what remains guards the one residual risk (a consumer reading stale data) and baseline staleness.

---

## Phase 5: The runtime path stays the one isolated context (US3)

**Goal**: `dtcgToResolved` is removed, the runtime consumer-theme resolver is the sole remaining JS resolution path, and no bundled theme flows through it.

**Independent Test**: `dtcgToResolved` is gone, the suite is green, and a grep confirms no JS path re-resolves a bundled theme.

- [X] T009 [US3] Remove `dtcgToResolved` from `src/resolve.ts` and its export from `src/index.ts`; drop its `src/resolve.test.ts` cases; switch the `src/validate.test.ts` helper that used it to the emitted artifact. (Depends on T004 + T007 — no caller remains once the MCP and the canary read the artifact.)
- [X] T010 [US3] Add a single-engine assertion (SC-001): a structural check that `dtcgToResolved` is absent from production code and no JS path re-resolves a bundled source theme (e.g. an explicit `grep -rn "dtcgToResolved" src` expectation in a test or a CI step), recorded so the absence is intentional. Confirm the runtime consumer-theme path (`registerTheme` / `resolveTheme`) is unchanged and the branded boundary still holds. (After T009.)

**Checkpoint**: one bundled-theme engine, one isolated runtime engine, nothing in between.

---

## Phase 6: Polish & Release

- [X] T011 Full verification: `pnpm --filter @unbranded-ds/tokens build`, `pnpm --filter @unbranded-ds/tokens test` (the 009 suites green and behavior-identical — the regression net), `pnpm typecheck`, `pnpm --filter @unbranded-ds/storybook build` (composition story renders), the MCP `tools/list` smoke, and `grep -rn "dtcgToResolved" packages/tokens/src` (expect none in production code).
- [X] T012 Add `.changeset/*.md` (`@unbranded-ds/tokens`: **patch** — internal plumbing, no consumer-facing change). Confirm whether Constitution Section III's "themes validated, fail loudly" wording references the old validation path closely enough to warrant a one-line patch clarification; if so, amend it in this PR. Run the changeset prose through the `humanizer`.

---

## Dependencies & Execution Order

### Phase order

**Setup (T001) → Foundational (T002, T003) → US1 repoints (T004, T005, T006) → US2 retirements (T007, T008) → US3 removal (T009, T010) → Polish (T011, T012).**

### Hard dependencies

- T002 + T003 block all of Phase 3+.
- T004 ∥ T005 (different files); T006 after both.
- T007 depends on T002 + T004; T008 depends on T003. T007 ∥ T008.
- T009 depends on T004 + T007 (no `dtcgToResolved` caller left); T010 after T009.
- T011 + T012 depend on everything.

### Parallel opportunities

- **The two repoints** (T004 MCP ∥ T005 validation) — disjoint files.
- **The two retirements** (T007 canary ∥ T008 regen check) — disjoint files, after their deps.
- Nothing else parallelizes; the spine is sequential by design (emit → read → delete).

---

## Implementation Strategy

### MVP (US1 — resolve once)

T001 → T002 + T003 → T004 + T005 → T006. Ships the single-engine resolution: the MCP and validation read the build's emitted data, and the 009 surfaces behave identically. The retirements (US2) and the `dtcgToResolved` removal (US3) are the payoff that follows.

### What "done" looks like

The satisfying inverse of a feature spec: **fewer tests, fewer code paths, one resolver for bundled themes.** The strongest signal is subtraction with the regression net intact — if the unchanged 009 suites still pass, the plumbing swap preserved behavior.

### Notes

- **The artifact is the DELTA, not the full set** (T002) — a full-set artifact clobbers composition. Emit theme-alone.
- **`defaults ⊕ delta == CSS full`** is the invariant the canary guards. A canary failure means a transform diverged between the two paths.
- **The generated baseline is committed** (T003) and regen-checked (T008) — do not hand-edit it.
- **Stop if a 009 test needs a value edit** (T006) — that means behavior changed, which this spec forbids.
