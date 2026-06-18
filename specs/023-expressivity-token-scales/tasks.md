# Tasks: Expressivity token scales (tracking and larger radii)

**Input**: Design documents from `/specs/023-expressivity-token-scales/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/token-scales.md

**Tests**: This feature has no new test files. It is verified through existing suites (`themes-contrast.test`, `defaults.test`, the token map test), updated for the new tokens, plus the expressivity audit and the Storybook a11y pass. Test-update tasks live in the story they belong to.

**Organization**: Tasks are grouped by user story. US1 (tracking) is the MVP — it alone takes the reference skin from 5 blockers to 2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1 / US2 / US3; setup and polish carry no story label

## Path conventions

Monorepo. Token work lives in `packages/tokens/`; the reference skin lives in the root `fixtures/themes/lcars/`.

---

## Phase 1: Setup

**Purpose**: Record the before-state so the 5 → 0 change is demonstrable.

- [X] T001 Capture the baseline: run `node scripts/expressivity-audit.mjs` (expect `EXPRESSIVITY BLOCKERS: 5`, 3 type + 2 shape) and `pnpm --filter @unbranded-ds/tokens test` (expect green), noting both results.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the spike artifacts this feature reroutes are present on the branch.

- [X] T002 Verify the spike prerequisites are on this branch (it stacks on `kendrick/expressivity-spike`): `scripts/expressivity-audit.mjs`, `fixtures/themes/lcars/parts.css`, and the `lcars-light`/`lcars-dark` cells in `packages/tokens/src/themes-contrast.test.ts`.

**Checkpoint**: baseline captured, prerequisites present — story work can begin.

---

## Phase 3: User Story 1 — Express letter-spacing through a token (Priority: P1) 🎯 MVP

**Goal**: Add a `--tracking-*` scale so a theme sets letter-spacing through a token. Reroute the reference skin's tracking, removing its 3 `type` blockers.

**Independent Test**: After this phase, `node scripts/expressivity-audit.mjs` reports 0 `type` blockers (total down to 2, only shape remaining).

- [X] T003 [P] [US1] Add a `trackingTokens` Zod object with six required keys (`tighter`, `tight`, `normal`, `wide`, `wider`, `widest`) and register it as a required top-level category in `tokensSchema` in `packages/tokens/src/schema.ts` (own category, not inside typography — see research.md Decision 1).
- [X] T004 [P] [US1] Create the DTCG source `packages/tokens/src/tokens/tracking.json` with the six stops and Tailwind v4 values (`tighter -0.05em` … `widest 0.1em`, `$type: "dimension"`) from research.md Decision 2 and data-model.md.
- [X] T004a [US1] Add `"tracking"` to the `TokenCategory` union and the `categoryMap` in the `typescript/token-map` format in `packages/tokens/sd.config.ts` (around lines 143 and 166). A brand-new top-level category otherwise falls through to `category: "tracking"`, which the hardcoded union rejects, so the generated `tokens.ts` fails `tsc`. This must land before the build in T005.
- [X] T005 [US1] Rebuild tokens: `pnpm --filter @unbranded-ds/tokens build`. Confirm `--tracking-*` variables appear in `packages/tokens/dist/css/tokens-*.css` and `dist/tailwind/preset.css`, and that `packages/tokens/src/defaults.generated.ts` regenerated with the `tracking` category.
- [X] T006 [US1] Update `packages/tokens/src/token-map.test.ts` (and `schema.test.ts` if it pins the category set) so the new tracking tokens are covered and the suites stay green.
- [X] T006a [US1] FR-002 coverage: in `packages/tokens/src/validate.test.ts`, assert a theme overriding only part of `tracking` (e.g. just `widest`) validates and inherits the remaining stops from the defaults.
- [X] T006b [US1] FR-007 coverage: in `packages/tokens/src/validate.test.ts`, assert a complete (fully-specified) theme missing a required new token (e.g. `tracking.widest`) fails with a structured `{ ok: false, issues: [{ path: 'tracking.widest' }] }`.
- [X] T007 [US1] Reroute tracking in `fixtures/themes/lcars/parts.css`: replace the three raw `letter-spacing` values (`0.18em`, `0.1em`, `0.12em`) with `var(--tracking-widest)`.
- [X] T008 [US1] Verify: `node scripts/expressivity-audit.mjs` reports 0 `type` blockers (total 2). Commit US1 as one granular commit.

**Checkpoint**: tracking is a token; the skin is at 2 blockers, all shape.

---

## Phase 4: User Story 2 — Build chunky/asymmetric corners from radius tokens (Priority: P2)

**Goal**: Extend the radius scale with chunky steps so the elbow composes from tokens. Reroute the reference skin's corners, removing its 2 `shape` blockers.

**Independent Test**: After this phase, `node scripts/expressivity-audit.mjs` reports `EXPRESSIVITY BLOCKERS: 0`.

- [X] T009 [P] [US2] Add `xl`, `2xl`, `3xl` as required keys to `radiiTokens` in `packages/tokens/src/schema.ts` (existing keys unchanged).
- [X] T010 [P] [US2] Add `xl` (0.75rem), `2xl` (1rem), `3xl` (1.5rem) to `packages/tokens/src/tokens/radii.json` (research.md Decision 3); leave `sm`/`md`/`lg`/`full` untouched.
- [X] T011 [US2] Rebuild tokens. Confirm `--radius-xl/2xl/3xl` emit and the `rounded-xl/2xl/3xl` utilities resolve from the preset; `defaults.generated.ts` regenerated.
- [X] T012 [US2] Update `packages/tokens/src/token-map.test.ts` / `schema.test.ts` for the three new radius keys if pinned.
- [X] T013 [US2] Reroute the elbow in `fixtures/themes/lcars/parts.css`: `border-radius: 1.75rem 0 1.75rem 0` → `var(--radius-3xl) 0 var(--radius-3xl) 0` on `[data-slot="card"]`, and `1.75rem 0 0 0` → `var(--radius-3xl) 0 0 0` on `[data-slot="card-header"]`.
- [X] T014 [US2] Verify: `node scripts/expressivity-audit.mjs` reports `EXPRESSIVITY BLOCKERS: 0` (SC-001). Commit US2 as one granular commit.

**Checkpoint**: the reference skin expresses its full look through tokens — zero blockers.

---

## Phase 5: User Story 3 — The accessibility contract holds (Priority: P3)

**Goal**: Confirm the rerouted skin stays accessible, in both color schemes.

**Independent Test**: The contrast suite and the Storybook a11y pass are both green.

- [X] T015 [US3] Run the token contrast suite: `pnpm --filter @unbranded-ds/tokens exec vitest run src/themes-contrast.test.ts`. Both `lcars-light` and `lcars-dark` stay AA on every pair (SC-002, token layer).
- [X] T016 [US3] Build react (`pnpm --filter @unbranded-ds/react build`) and run the a11y test-runner over the skin: `pnpm --filter @unbranded-ds/storybook exec vitest run --project storybook -t "LCARS"`. Both LCARS stories pass axe in light and dark (SC-002, rendered layer).

**Checkpoint**: range under invariant contract holds — zero blockers, zero a11y violations.

---

## Phase 6: Polish & Cross-Cutting

**Purpose**: Refresh the emitted artifacts, document, version, and run the full gate.

- [X] T017 Refresh the fixture artifacts: set `blockers` to 0 in `fixtures/themes/lcars/meta.json`, update the count in `fixtures/themes/index.json`, and regenerate `fixtures/expressivity-report.json` via `node scripts/expressivity-audit.mjs --emit`.
- [X] T018 [P] Verify the token-query MCP surfaces the new tokens (no code change expected): `lookupToken('tracking.widest')` resolves to `0.1em` / `--tracking-widest`, `palette('tracking')` returns the scale, and `palette('radius')` includes `xl/2xl/3xl`.
- [X] T019 [P] Add a THEMING.md note: the `tracking` scale, and composing an asymmetric radius per-corner from radius tokens. Run the addition through the `humanizer` skill (Constitution XI.1); no three-item lists.
- [X] T020 [P] Update `fixtures/README.md` "Where it stands" to reflect LCARS at 0 blockers. Run through the `humanizer`.
- [X] T021 [P] Add a `.changeset/*.md` declaring the `@unbranded-ds/tokens` minor bump (0.5.0 → 0.6.0), naming the two new scales and the breaking change for fully-specified external themes. Humanize the changeset prose.
- [X] T022 Run the full gate: `pnpm --filter @unbranded-ds/tokens test`, `pnpm --filter @unbranded-ds/tokens typecheck`, and a final `node scripts/expressivity-audit.mjs` (0). Commit the polish as one granular commit.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** and **Foundational (Phase 2)** first.
- **US1 (Phase 3)** is the MVP and goes first among stories. It edits `schema.ts` and regenerates `defaults.generated.ts`. Within it, **T004a precedes T005**: the build's `tsc` step rejects the new `tracking` category until the token-map types include it.
- **US2 (Phase 4)** follows US1 — it touches the same `schema.ts` and the regenerated defaults, so it is sequential, not parallel, with US1.
- **US3 (Phase 5)** follows US2 — it verifies the a11y contract over the fully rerouted skin.
- **Polish (Phase 6)** last. T018–T021 are mutually parallel (different files); T017 and T022 bracket them.

## Parallel opportunities

- Within US1: T003 (schema) and T004 (`tracking.json`) are different files — run together.
- Within US2: T009 (schema) and T010 (`radii.json`) are different files — run together.
- In Polish: T018, T019, T020, T021 touch different files and can run together.

## Implementation strategy

- **MVP = US1 alone.** Shipping just the tracking scale takes the reference skin from 5 blockers to 2 and proves the find-grow-recheck loop on the larger of the two gaps. US2 then closes the remainder to 0.
- **Commit granularly** (per the project's preference): one commit at each story checkpoint (T008, T014) and one for polish (T022), each with a humanized message and no coauthor trailer.
- **Acceptance is the audit plus the guards**: SC-001 is `EXPRESSIVITY BLOCKERS: 0`; SC-002 is the contrast suite and the a11y pass green; SC-003 is `defaults.test` and the unchanged pre-existing token values.
