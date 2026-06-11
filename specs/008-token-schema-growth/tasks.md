# Tasks: Token schema growth

**Input**: Design documents from `/specs/008-token-schema-growth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: The validator change (resolve-then-validate) is logic that needs coverage, and the tokens package already has `schema.test.ts` / `validate.test.ts` / `runtime.test.ts` + fixtures. Test tasks are included for the schema and validator changes, following that established convention. Pure token-source additions are verified by build-output assertions. Coverage spans the merge helper directly (`resolveTheme`), the validator at both call sites, partial-theme injection, the MISSING_TOKEN-after-merge path (SC-005), and Tailwind utility generation, not only variable emission.

**Organization**: By user story. The two front tracks — US1 (token additions) and US2 (validator) — are independent after the foundational schema change and run in parallel. The two shared chokepoint files are `schema.ts` (foundational) and `sd.config.ts` (build wiring).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: parallelizable (different file, no dependency on an incomplete task)
- All paths are under `packages/tokens/` unless noted

---

## Phase 1: Setup

- [ ] T001 Verify the baseline is green before changes: `pnpm --filter @unbranded-ds/tokens build && pnpm --filter @unbranded-ds/tokens test && pnpm typecheck`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ `schema.ts` is the shared chokepoint — US1, US2, and US4 all build on it. It is one file, so its changes are one task, not parallelizable.**

- [ ] T002 Extend and loosen `packages/tokens/src/schema.ts`: add `motionTokens` (required: `duration.{fast,base,slow}`, `easing.{standard,decelerate,accelerate}`); add typography keys `font-serif`, `size-2xl`, `size-3xl` (required); add `ringTokens` and `zIndexTokens` (optional); loosen every category object so a runtime theme may supply a partial subset (categories/keys optional); and export the resolved canonical default token set for the merge. Per `contracts/token-schema.md`.

**Checkpoint**: Schema accepts the new vocabulary and partial themes; defaults are exportable. US1, US2, US4 can now proceed in parallel.

---

## Phase 3: User Story 1 - Canonical tokens for serif, motion, larger type (Priority: P1) 🎯 MVP

**Goal**: The for-coleman required additions (`font-serif`, `motion`, `2xl`/`3xl`) ship and resolve to real CSS vars + Tailwind utilities.

**Independent Test**: Build and confirm a consumer can use `font-serif`, a motion duration/easing, and a `2xl`/`3xl` size — all resolving in the four artifacts and per-theme CSS — without authoring the values.

- [ ] T003 [P] [US1] Create `packages/tokens/src/tokens/motion.json` with durations (120/240/480ms, `$type: duration`) and easings (standard/decelerate/accelerate cubic-beziers, `$type: cubicBezier`) per `contracts/token-schema.md`.
- [ ] T004 [P] [US1] Edit `packages/tokens/src/tokens/typography.json` — add `font-serif` (`fontFamily`, system serif stack), `size-2xl` (`1.5rem`), `size-3xl` (`1.875rem`).
- [ ] T005 [US1] Extend `packages/tokens/sd.config.ts` — add the new categories (`motion`, `ring`, `z-index`) to `categoryMap` and the `TokenCategory` union, and special-case the motion category's CSS-var naming so easings emit `--ease-*` and durations emit `--duration-*` (never `--motion-*`). Shared chokepoint file; this task also wires US4's categories. Depends on T002 and the source files (T003, T004, T013, T014).
- [ ] T006 [US1] Run `pnpm --filter @unbranded-ds/tokens build`; verify `--ease-standard`, `--duration-base`, `--typography-font-serif`, `--typography-size-2xl`, `--typography-size-3xl` appear in all four artifacts (`dist/tailwind/preset.css`, `dist/ts/tokens.ts`, `dist/json/tokens.json`) and in each per-theme `dist/css/tokens-*.css`. Also assert the new categories (`motion`, `ring`, `z-index`) appear in the TS token map's `TokenCategory` set (update `exports.test.ts` if it pins the category list).
- [ ] T006a [US1] Verify the easing tokens generate real Tailwind utility classes (`ease-standard`, `ease-decelerate`, `ease-accelerate`), not only that the `--ease-*` variables are emitted. Assert against a Tailwind build of the preset or a Storybook smoke check; this guards the var-emitted-but-utility-missing failure mode (the spec-007 `@source` bug class). Note that `duration-*` is not a v4 namespace, so durations are verified as `--duration-*` variables consumed via arbitrary values, not as generated utilities.
- [ ] T007 [P] [US1] Update `packages/tokens/src/schema.test.ts` to assert the `motion` category and the new typography keys are required in the schema.

**Checkpoint**: New required tokens resolve everywhere. MVP deliverable.

---

## Phase 4: User Story 2 - Themes override any category, resolve-then-validate (Priority: P2)

**Goal**: A runtime theme may override any category; validation runs against the merged result, closing the contrast-skip hole at both call sites.

**Independent Test**: A partial theme (color + radius) validates by inheriting defaults; a theme that overrides one side of a contrast pair and inherits the other fails AA (not skipped); a color-only legacy theme still passes.

**Runs in parallel with US1** — depends only on T002, shares no files with the token-source work.

- [ ] T008 [US2] Add a `resolveTheme(partial)` deep-merge helper (canonical defaults under the override, override wins) in `packages/tokens/src/` per `contracts/validate-theme.md`.
- [ ] T009 [US2] Edit `packages/tokens/src/validate.ts` — resolve the partial theme against defaults, then validate completeness + contrast on the merged result; remove the `if (!fgValue || !bgValue) continue` skip (line 83) so inherited pairs are checked.
- [ ] T010 [US2] Edit `packages/tokens/src/runtime.ts` — apply the same resolve before the post-oklch-conversion contrast pass; remove the matching skip (line 97) so `registerTheme` checks the full pair set.
- [ ] T011 [P] [US2] Add fixtures under `packages/tokens/src/__fixtures__/`: a partial theme (color + radius only) that should pass by inheritance, and an inherited-pair theme that overrides `color.background` to fail AA against the inherited `color.foreground`.
- [ ] T011a [P] [US2] Add a direct unit test for `resolveTheme` (e.g. `packages/tokens/src/resolve.test.ts`): override wins; nested categories merge per-key rather than replacing the whole category; omitted keys and omitted categories inherit the defaults. This is the core new logic and is otherwise only covered indirectly.
- [ ] T012 [US2] Update `packages/tokens/src/validate.test.ts` and `runtime.test.ts` — assert partial-theme acceptance, inherited-pair `CONTRAST_FAILURE`, and no color-only regression.
- [ ] T012a [US2] Assert `registerTheme(partialTheme)` injects a complete `<style>` block (the full merged variable set rather than only the overridden keys), confirming it iterates the resolved theme rather than the raw input.
- [ ] T012b [US2] Add a MISSING_TOKEN-after-merge test (SC-005): a token absent from both the override and a synthetically incomplete defaults set yields a structured `MISSING_TOKEN` issue naming the path.

**Checkpoint**: The validation model is correct against merged themes.

---

## Phase 5: User Story 4 - Drift-killing optional tokens (Priority: P3)

**Goal**: `ring.width` and an ordered `z-index` scale ship as optional tokens (tokens-package only; the component retrofit is spec 010).

**Independent Test**: `--ring-width` and `--z-index-*` appear in all four artifacts; a theme omitting both still builds and validates by inheritance.

**Source files run in parallel** with US1/US2 after T002.

- [ ] T013 [P] [US4] Create `packages/tokens/src/tokens/ring.json` — `ring.width: 3px` (`dimension`), the value the hardcoded `ring-3` usages resolve to.
- [ ] T014 [P] [US4] Create `packages/tokens/src/tokens/z-index.json` — an ordered layering scale (e.g. `overlay` < `popover` < `tooltip`) so a tooltip sits above a dialog, giving nested overlays a defined order. Finalize stop names/values here.
- [ ] T015 [US4] After T005 + build, verify `--ring-width` and `--z-index-*` appear in all four artifacts, and that a theme omitting `ring`/`z-index` validates by inheritance (no `MISSING_TOKEN`).
- [ ] T016 [P] [US4] Add a test asserting `ring` and `z-index` are optional: a theme omitting them validates clean.

**Checkpoint**: Optional drift tokens shipped; the latent `z-50` ordering is encoded (the component fix is deferred to spec 010).

---

## Phase 6: User Story 3 - Documented schema extension + the two-formats distinction (Priority: P3)

**Goal**: THEMING.md gains the extend-schema walkthrough, the override-non-color subsection (with the enriched brand theme as the example), and a crystal-clear distinction between the two theme concepts.

**Independent Test**: A contributor follows the walkthrough to add a category end to end; the distinction section has a complete worked example of each theme format.

**Depends on US1/US2/US4 being settled** (it documents them).

- [ ] T017 [P] [US3] Edit `packages/tokens/themes/brand.json` — add a `radius` override (distinct corner rounding) plus a `typography` override (font weight or family); leave `light.json` and `dark.json` color-only (FR-023). Independent file; can land any time after T002. Verify brand's resolved `dist/css/tokens-brand.css` reflects the radius and typography override (SC-003).
- [ ] T018 [US3] Add the "Extending the schema" walkthrough to `THEMING.md` using the motion category as the worked example (source file → schema → theme → regenerate → verify in all four outputs).
- [ ] T019 [US3] Add the "Overriding non-color tokens" subsection to `THEMING.md`, pointing at the enriched `brand.json` and explaining inherit-on-omit. Depends on T017.
- [ ] T020 [US3] Add the token-source-override vs runtime-theme distinction to `THEMING.md` (FR-022): name which pipeline each serves, with a complete worked example of each format.
- [ ] T021 [US3] Run all new THEMING.md prose through the `humanizer` skill (audit-and-revise loop) before merge, per the project prose rule.

**Checkpoint**: Docs make the two theme formats unmistakable and the extension path followable.

---

## Phase 7: Polish & Release

- [ ] T022 Full verification: `pnpm --filter @unbranded-ds/tokens build && pnpm --filter @unbranded-ds/tokens test && pnpm typecheck`; confirm every new token in all four artifacts; confirm the validator merge path uses no browser globals (SSR-safe).
- [ ] T023 Add `.changeset/*.md` declaring `@unbranded-ds/tokens: minor` (0.4.0), announcing the breaking change to consumer runtime themes (the newly required tokens). The `@unbranded-ds/react` patch is automatic via `updateInternalDependencies: "patch"`; no react source change.

---

## Dependencies & Execution Order

### Phase order

- **Setup (T001)** → **Foundational (T002)** → **US1 ∥ US2 ∥ US4-sources** → **build wiring (T005) + build-verify (T006/T015)** → **US3 docs** → **Polish/Release**.

### The two chokepoint files

- `schema.ts` — T002 only (foundational). All schema changes in one task because it is one file.
- `sd.config.ts` — T005 only (covers motion naming + all new categories). One file, one task.

### Story dependencies

- **US1, US2, US4 are mutually independent** after T002 — they share no files except the two chokepoints (T002 done first; T005 is a single convergence task).
- **US3** depends on US1/US2/US4 (it documents them) and on T017 (brand.json) for its override example.
- **Polish/Release** depends on everything.

### Parallel opportunities

- **The headline split**: US1 (T003–T007) ∥ US2 (T008–T012) ∥ US4 sources (T013–T014). Hand US2 (the validator refactor) to a separate worker — it touches only `validate.ts`, `runtime.ts`, fixtures, and tests.
- `[P]` source files: T003 (motion.json), T004 (typography.json), T013 (ring.json), T014 (z-index.json) — four disjoint files.
- `[P]` tests/fixtures: T007 (schema.test), T011 (fixtures), T011a (resolveTheme unit test), T016 (optional-token test).
- `[P]` T017 (brand.json) — disjoint file, any time after T002.

---

## Parallel Example: the front tracks

```bash
# After T002 (foundational schema) lands, two workers in parallel:

# Worker A — US1 token additions:
T003 motion.json  ∥  T004 typography.json        # disjoint source files
→ T005 sd.config.ts (build wiring, all categories)
→ T006 build + verify artifacts
T007 schema.test.ts                               # parallel with the above

# Worker B — US2 validator (shares no files with A):
T008 resolveTheme helper
→ T009 validate.ts  →  T010 runtime.ts
T011 fixtures (parallel)
→ T012 validate.test.ts + runtime.test.ts
```

---

## Implementation Strategy

### MVP (US1 only)

T001 → T002 → T003/T004 → T005 → T006. Ships the for-coleman required tokens resolving in all artifacts. Stop and validate; this alone is a shippable increment.

### Incremental delivery

1. Foundational + US1 → MVP (new tokens resolve).
2. US2 in parallel → partial themes validate against the merged result.
3. US4 → optional drift tokens shipped.
4. US3 → docs make it legible.
5. Polish + changeset → release 0.4.0.

### Notes

- Motion var naming is the one special case (`--ease-*`/`--duration-*`, not `--motion-*`).
- The contrast skip is in two files (`validate.ts:83`, `runtime.ts:97`) — fix both.
- Built-in themes inherit the new required tokens from `src/tokens` defaults; do not duplicate them into `light`/`dark`/`brand`.
- THEMING.md prose runs through the humanizer before merge.
