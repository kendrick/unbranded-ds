# Tasks: Theming system expansion

**Input**: Design documents from `/specs/009-theming-system-expansion/`
**Prerequisites**: plan.md, spec.md, research.md (9 decisions), data-model.md, contracts/

**Tests**: Required and embedded per unit (the user asked to test everything we should; the plan's Testing Strategy is the contract). Each surface ships its own tests; the cross-surface **resolution-parity oracle** is the integration backstop.

**Organization**: By code surface, not strictly by user story. The surfaces serve more than one story — the build emits both the composition CSS (US1) and the unified token map (US2); the axis layout carries both the composition axes (US1) and the demo themes (US3). So each surface gets one owner (avoids same-file races) and a story tag for traceability. This follows the per-surface pattern from specs 007/008/010. All paths are under `packages/tokens/` unless noted.

## Format: `[ID] [P?] [Story] Description`

- **[P]** = parallelizable: a different file with no dependency on an incomplete task.
- The five Phase-3 units are mutually `[P]`; tasks _within_ a unit that share a file are sequential.

---

## Phase 1: Setup

- [ ] T001 Confirm baseline green before changes: `pnpm --filter @unbranded-ds/tokens test && pnpm --filter @unbranded-ds/tokens build && pnpm typecheck`.

---

## Phase 2: Foundational (blocks the entire Phase 3 wave)

**⚠️ Everything downstream calls `composeTokens` and reads the axis layout. These two units (F1, F2) are `[P]` with each other — disjoint files — but both must land before Phase 3.**

### F1 — the one shared merge

- [ ] T002 [P] In `src/resolve.ts`: extract the per-key override loop from `resolveTheme` into `mergeLayer(base, override)`; refactor `resolveTheme` to `mergeLayer(seedFromDefaults(), partial)` (behavior unchanged); add `composeTokens(orderedPartials: Array<Partial<ResolvedTokens>>): ResolvedTokens` as the left fold `orderedPartials.reduce(mergeLayer, seedFromDefaults())` (each layer is an axis's resolved **delta**, density last wins — NOT complete sets, which would clobber); add `dtcgToResolved(dtcg): Partial<ResolvedTokens>` (reuse the `walkSubtree` recursion from `mcp/themes.ts`); make `ResolvedTokens` a **branded/nominal type** so `dtcgToResolved`/`resolveTheme`/`composeTokens` are the only producers and raw DTCG can't be passed where resolved tokens are expected (brand `canonicalDefaultTokens` too). Export the new symbols via `src/index.ts`.
- [ ] T003 [P] In `src/resolve.test.ts`: cover `composeTokens` (fold; density-wins-on-overlap; delta-fold does NOT clobber aesthetic's non-density keys; single layer = identity; empty = defaults) and `dtcgToResolved` (DTCG → flat); confirm the existing `resolveTheme` tests still pass after the `mergeLayer` extraction. (After T002.)

### F2 — the axis layout + demo themes

- [ ] T004 [P] Create `themes/aesthetic/` and `themes/density/`; move `light.json`, `dark.json`, `brand.json` into `aesthetic/`; add `src/axes.ts` exporting `type Axis = 'aesthetic' | 'density'`, `AXIS_ATTRIBUTE` (`{ aesthetic: 'data-theme', density: 'data-density' }`), and `listThemesByAxis()` (walks `themes/<axis>/*.json`). Re-point the theme-discovery `readdir` in `sd.config.ts` and the loader in `src/mcp/themes.ts` to `listThemesByAxis()` so the build and MCP stay green with the new layout (the minimal keep-green wiring; the deeper per-axis emission is T009).
- [ ] T005 [P] Author the demo themes (DTCG): `themes/aesthetic/vaporwave.json` (overrides `color`, `shadow` including the extension token `shadows.neon` → emits `--shadow-neon`, and `typography` font family) and `themes/density/compact.json` (overrides `spacing` and `typography` line-heights). (After T004 — needs the dirs.)
- [ ] T006 [P] In `src/axes.test.ts`: assert `listThemesByAxis()` groups light/dark/brand/vaporwave under `aesthetic` and compact under `density`, and `AXIS_ATTRIBUTE` maps correctly. (After T004.)

**Checkpoint**: `composeTokens`/`dtcgToResolved`/the branded type exist and are tested; the axis dirs, helper, and demo themes exist; the build and MCP still pass. The wave can start.

---

## Phase 3: The parallel wave (five disjoint units, each ships its tests)

**All five units are `[P]` with each other — no two share a file. Each consumes F1 (`composeTokens`, `dtcgToResolved`) and F2 (the axis helper, the demo themes).**

### P1 — Validator (US1)

- [ ] T007 [P] [US1] In `src/validate.ts`: generalize the resolve step to resolve each named axis to its delta and fold via `composeTokens([aesthetic, density])`; run the existing completeness + WCAG-contrast checks on the **composed** result; add an `AXIS_CONFLICT` structured issue (`{ code, path, message }`) when two themes are assigned to one axis.
- [ ] T008 [US1] In `src/validate.test.ts`: a density value that breaks an aesthetic's AA pair fails loudly on the composed result; `AXIS_CONFLICT` on two-themes-one-axis; single-axis (pre-009) validation is byte-identical to before (FR-005 regression). (After T007.)

### P2 — Build + token map (US1 + US2)

- [ ] T009 [P] [US1] In `sd.config.ts`: emit aesthetic themes as the full resolved set under `[data-theme="<name>"]` wrapped in `@layer ds-aesthetic`, and density themes as their **delta only** under `[data-density="<name>"]` wrapped in `@layer ds-density`; emit the layer-order declaration `@layer ds-aesthetic, ds-density;` so density wins independent of import order. (Custom format wrapping the `css/variables` body in `@layer NAME { … }`.)
- [ ] T010 [US2] In `sd.config.ts` (token-map format) + `src/token-map.ts` + `src/index.ts`: generate the token map from the union of schema tokens (`source: 'schema'`) and tokens found by walking the bundled themes that are absent from the schema (`source: 'theme-extension'`, e.g. `shadows.neon` → `--shadow-neon`); make `source?` an optional (additive) field on `TokenDefinition`, always emitted as a value; retire the hand-authored/orphan-generated split by repointing the export at the generated map. (After T009 — same `sd.config.ts`.)
- [ ] T011 [US2] Add `src/token-map.test.ts` (drift guard modeled on `defaults.test.ts`): every schema token present with `source:'schema'` and unchanged shape; `shadows.neon` present with `source:'theme-extension'` + correct `type`/`cssVariable`; dedupe across themes. Update `src/exports.test.ts` if the export repointed. (After T010.)

### P3 — MCP (US2)

- [ ] T012 [P] [US2] Across `src/mcp/*` (tools + `themes.ts` + a shared axis input schema): change each tool's `theme?: string` to `theme?: { aesthetic?: string; density?: string }`; resolve via a `composeAxes()` built on `dtcgToResolved` + `composeTokens`; add `source` to `palette`/`lookupToken` (computed from `tokenMap` membership); stop hard-rejecting non-schema tokens in `lookupToken` (return them as `source:'theme-extension'` with a synthesized `cssVariable`); add the soft "real extension, absent from the active composition" response (`present:false`) vs the hard `unknown-token`; an unrecognized axis is ignored, others still resolve; `listThemes` reports each theme's axis + adds vaporwave/compact descriptions. Bump `SERVER_VERSION`.
- [ ] T013 [US2] Migrate/extend the MCP tests (`lookupToken.test.ts`, `palette.test.ts`, `contrast.test.ts`, `smoke.test.ts`): bare-string → axis-object input; `source` labels; extension token returned not rejected; soft-absent vs hard unknown; unknown-axis ignored; `tools/list` still returns the four tools. (After T012.)
- [ ] T014 [P] [US2] Update the contract doc `specs/005-agent-experience-foundation/contracts/token-query-mcp.md` per `contracts/token-query-mcp-v2.md` (axis-object inputs, `source` fields, the soft absent-response, the axis-model prose section, the version note). Run the prose through the `humanizer` skill.

### P4 — Runtime (US1)

- [ ] T015 [P] [US1] In `src/runtime.ts`: emit composed vars under the per-axis attribute selectors (aesthetic `[data-theme]`, density `[data-density]`) so the injected values equal `composeTokens(...)`; update the first-paint bootstrap script to write both `data-theme` and `data-density`.
- [ ] T016 [US1] In `src/runtime.test.ts`: per-axis selector emission; composed injected vars equal `composeTokens` output; bootstrap writes `data-density`. (After T015.)

### P5 — Docs + constitution (US3)

- [ ] T017 [P] [US3] In `THEMING.md`: add a composition section (the two axes, the attributes, density-over-aesthetic precedence, a worked two-axis example) and a theme-extension-tokens section (the build flow, the typed entry, MCP visibility, a `shadows.neon` worked example). Run the prose through the `humanizer` skill.
- [ ] T018 [P] [US3] In `README.md`: add a multi-axis quickstart using the shipped vaporwave + compact themes. Run the prose through the `humanizer` skill.
- [ ] T019 [P] Amend `.specify/memory/constitution.md` Section III (bump 1.1.1 → 1.2.0): name the per-axis composition API + the recognized axes (aesthetic/density), state the density-over-aesthetic precedence, and clarify that the schema-lock applies to the canonical token set (extension tokens are a documented per-theme escape hatch). Update the Sync Impact Report header. Run the prose through the `humanizer` skill.

**Checkpoint**: every surface composes through the one resolver; the token map carries extension tokens; the MCP speaks multi-axis; the runtime and the cascade mirror the resolver; docs + Section III reflect the API.

---

## Phase 4: Integration & the robustness backstop

- [ ] T020 [US1] Add `src/resolution-parity.test.ts` — the cross-surface oracle. For every `(aesthetic ∈ {light,dark,brand,vaporwave,∅}) × (density ∈ {compact,∅})` and every token, assert `composeTokens(...)` === the value the emitted `dist` CSS yields (parse the CSS, apply the known `@layer` order — no browser) === the MCP response. (Depends on T009/T010 build + T012 MCP + F1.)
- [ ] T021 [US1] Add a composition Storybook story (a `play` function applying `data-theme="vaporwave" data-density="compact"`, asserting the composed computed values and that a deliberate-overlap token resolves to the density value — the real-cascade confirmation of T020), with the a11y check. (Depends on T009 build + T015 runtime.)
- [ ] T022 [US3] Verify the demo themes end-to-end: `vaporwave.json` + `compact.json` validate and build; composing them yields the union; `shadows.neon` emits as `--shadow-neon` and surfaces in the token map (T011) and the MCP (T013). (A focused assertion; may live in `token-map.test.ts`/an MCP test rather than a new file.)

**Checkpoint**: the JS resolver, the emitted CSS, and the MCP provably agree across the full matrix; the live cascade confirms it in a browser.

---

## Phase 5: Polish & Release

- [ ] T023 Full verification: `pnpm --filter @unbranded-ds/tokens test`, `pnpm --filter @unbranded-ds/tokens build`, `pnpm typecheck`, `pnpm --filter @unbranded-ds/react lint`, `pnpm --filter @unbranded-ds/storybook build && pnpm --filter @unbranded-ds/storybook test:storybook` (composition story + a11y), and confirm the CI MCP `tools/list` smoke still passes. Grep the emitted CSS for `@layer ds-aesthetic, ds-density;` and for `--shadow-neon`.
- [ ] T024 Add `.changeset/*.md`: `@unbranded-ds/tokens` **minor**. Name the composition API, the extension-token visibility, and call out the Section III amendment (1.1.1 → 1.2.0) shipping in-PR. Run the changeset prose through the `humanizer` skill.

---

## Dependencies & Execution Order

### Phase order

**Setup (T001) → Foundational {F1, F2} (T002–T006) → Wave {P1…P5} (T007–T019) → Integration (T020–T022) → Polish (T023–T024).**

### Hard dependencies

- T002 (the resolver) and T004 (the axis helper) block the entire wave; T005 depends on T004 (dirs).
- Within each unit: T008←T007, T010←T009←(F2 readdir), T011←T010, T013←T012, T016←T015.
- T020 (parity oracle) depends on T009/T010 (emitted CSS) + T012 (MCP) + F1.
- T021 (story) depends on T009 (CSS) + T015 (runtime).
- T023/T024 depend on everything.

### Parallel opportunities

- **Foundational**: F1 (T002/T003) ∥ F2 (T004/T005/T006) — disjoint files.
- **The wave is 5-wide**: P1, P2, P3, P4, P5 run concurrently after the checkpoint. Hand each unit to one owner. The doc tasks (T014, T017, T018, T019) are additionally `[P]` within and across units (separate files).
- Nothing in Setup, Integration, or Polish parallelizes meaningfully (gates/single-file).

---

## Parallel Example: the wave

```text
# After F1 + F2 land, five owners in parallel:
P1 Validator → T007, T008        (validate.ts)
P2 Build+map → T009, T010, T011  (sd.config.ts, token-map.ts, index.ts, *.test)
P3 MCP       → T012, T013, T014  (src/mcp/*, contract doc)
P4 Runtime   → T015, T016        (runtime.ts)
P5 Docs+const→ T017, T018, T019  (THEMING.md, README.md, constitution.md)
# Converge → T020 parity oracle + T021 story → T023 verify → T024 changeset.
```

---

## Implementation Strategy

### MVP (US1 — composition end-to-end)

F1 + F2 → P1 (validator) + P2's T009 (CSS @layer) + P4 (runtime) → T020 (parity) + T021 (story). Ships a consumer applying `vaporwave` + `compact` with density winning, proven across resolver/CSS/runtime. The extension-token typing (US2) and the docs (US3) layer on without reworking it.

### Full delivery

1. Setup + foundational (T001–T006).
2. The 5-wide wave (T007–T019).
3. Integration: parity oracle + story + demo-theme check (T020–T022).
4. Verify + changeset (T023–T024).

### Notes

- **The delta-fold is the correctness crux** (research D2): compose folds each axis's resolved _overrides_, not complete sets. A complete-set merge clobbers; the tests in T003 pin this.
- **The parity oracle (T020) is the robustness backstop** (research D9): it services the interest on the inherited multi-engine debt. The principal is the resolution-unification follow-up; T020 gets deleted when that lands.
- **Density emits its delta, not the full set** (T009) — else it clobbers aesthetic's non-density tokens. Verify the emitted density CSS contains only compact's overrides.
- **`source` is optional** on `TokenDefinition` — existing consumers keep compiling; always emit a value.
- **All prose through the humanizer** (T014, T017, T018, T019, T024).
- **Section III amendment ships in this PR** with its rationale (governance procedure); the changeset is tokens-minor.
