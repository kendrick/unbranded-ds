# Tasks: Accessible destructive Button across every theme

**Input**: Design documents from `/specs/018-button-destructive-contrast/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Required. The constitution mandates the three test layers (Section VI), the token change carries a validator pair and the per-cell matrix, and US2 is itself the durable test guard. Test tasks are included.

**Organization**: By user story. The token foundation (the pair, authored AA per cell) blocks both the Button fix (US1) and the validator guard (US2); those two live in different packages and run in parallel; the example cutover (US3) depends on the Button fix.

Paths are relative to the repo root.

## Phase 1: Setup

- [x] T001 Add `destructive-subtle` and `destructive-subtle-foreground` as required keys in `colorTokens` in `packages/tokens/src/schema.ts`. (Schema foundation only; values and the contrast guard follow. The tokens build is intentionally red until the cells provide values in Phase 2.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: The AA-passing values below block US1 (the Button renders them) and US2 (the guard validates them). Each pair is opaque and verified with the package's own `contrastRatio` (the tsx check that proved the spec-016 palettes), targeting ≥5:1 at rest. Verify the hover-state composite too (the bounded `color-mix` darken from T007) clears 4.5:1, since the validator's token-vs-token pairs cannot express a composite — the rest headroom is what guarantees it.

- [x] T002 [P] Author and verify the `destructive-subtle` / `destructive-subtle-foreground` pair for default-light (the canonical baseline) in `packages/tokens/src/tokens/color.json` (opaque, ≥5:1).
- [x] T003 [P] Author and verify the pair for default-dark in `packages/tokens/themes/color-scheme/dark.json`.
- [x] T004 [P] Author and verify the pair for brand-light and brand-dark in `packages/tokens/themes/theme/brand/light.json` and `packages/tokens/themes/theme/brand/dark.json`.
- [x] T005 [P] Author and verify the pair for vaporwave-light and vaporwave-dark in `packages/tokens/themes/theme/vaporwave/light.json` and `packages/tokens/themes/theme/vaporwave/dark.json`.
- [x] T006 Build the tokens (`pnpm --filter @unbranded-ds/tokens build`), commit the regenerated `packages/tokens/src/defaults.generated.ts`, and confirm `--color-destructive-subtle` and `--color-destructive-subtle-foreground` emit in every per-cell CSS file plus the Tailwind preset utilities (depends on T001–T005).

**Checkpoint**: the pair exists, is opaque, and clears AA in all six cells.

---

## Phase 3: User Story 1 - A legible destructive button in any theme (Priority: P1) 🎯 MVP

**Goal**: The destructive Button meets AA in every shipped theme, on the page background and on card/muted surfaces, at rest and on hover.

**Independent Test**: Render `<Button variant="destructive">` in each of the six identity-by-scheme combinations and measure label-to-background contrast; every cell is ≥4.5:1, and the button still reads as destructive.

- [x] T007 [US1] Update the `destructive` variant in `packages/react/src/components/Button/Button.tsx` to `bg-destructive-subtle text-destructive-subtle-foreground`, with hover deepening the surface via a bounded `color-mix` darken (a fixed small percentage of `destructive` mixed into the opaque subtle token, so the rest-state headroom keeps hover ≥4.5:1) and the existing destructive focus ring; remove the `dark:` color overrides (the per-cell tokens carry the light/dark difference now).
- [x] T008 [P] [US1] Unit-test the resolved destructive classes in `packages/react/src/components/Button/Button.test.tsx`: the variant emits `bg-destructive-subtle` / `text-destructive-subtle-foreground` and no `dark:` destructive color branch.
- [x] T009 [P] [US1] Confirm the Destructive story in `packages/react/src/components/Button/Button.stories.tsx` carries a `play` and renders zero serious/critical axe violations (add an explicit interaction assertion if the story lacks one).

**Checkpoint**: the destructive Button is AA-legible across themes (the MVP).

---

## Phase 4: User Story 2 - The design system catches a sub-AA destructive treatment automatically (Priority: P2)

**Goal**: The validator guards the destructive-subtle pair for every cell, so the fix can't silently regress.

**Independent Test**: Introduce a deliberately failing `destructive-subtle` value, run the token validation, and confirm a structured `CONTRAST_FAILURE` naming the pair and cell; revert and the build passes.

- [x] T010 [US2] Add `{ foreground: 'color.destructive-subtle-foreground', background: 'color.destructive-subtle', threshold: 4.5 }` to `contrastPairs` in `packages/tokens/src/schema.ts` (the sixth declared pair).
- [x] T011 [P] [US2] Update `packages/tokens/src/schema.test.ts`: bump the declared-pair count to six, assert the destructive-subtle pair is present, and confirm the two new color keys parse in `colorTokens`. Update any complete-theme fixtures that validate against the strict `themeSchema` (e.g., `validCustom` in this file, and any complete theme under `packages/tokens/src/__fixtures__/`) to carry the two now-required keys; partial fixtures (`deepPartial`) are unaffected.
- [x] T012 [P] [US2] Add explicit assertions in `packages/tokens/src/themes-contrast.test.ts` that the destructive-subtle pair clears 4.5:1 in all six cells (the matrix already iterates `contrastPairs`; name the pair for legibility) AND that the hover-state surface (the bounded `color-mix` darken from T007) still clears 4.5:1 against the foreground — compute the oklab mix in the test, since the validator's token-vs-token pairs cannot express a composite. This is the committed verification of FR-003's hover requirement.
- [x] T013 [US2] Add a guard test in `packages/tokens/src/validate.test.ts` that a sub-AA destructive-subtle value makes `validateResolved`/`validateComposedTheme` return a `CONTRAST_FAILURE` whose path names the destructive-subtle pair (depends on T010).

**Checkpoint**: a destructive-subtle regression fails the build with a structured, named issue.

---

## Phase 5: User Story 3 - The example demonstrates a fully styled light mode (Priority: P3)

**Goal**: The example app re-enables its light scheme and stays accessibility-clean, closing the spec-016 workaround.

**Independent Test**: With the light scheme loaded, the example's Playwright axe pass on `/` and `/showcase` reports zero serious or critical violations.

- [x] T014 [US3] Re-add `@import '@unbranded-ds/tokens/themes/light.css';` to `examples/nextjs-15-app-router/app/globals.css` (the import spec 016 removed to dodge the failing button), keeping the consumer-override block intact.
- [x] T015 [US3] Run `pnpm --filter @unbranded-ds/example-nextjs e2e` and confirm the existing `tests/a11y.spec.ts` axe pass on `/` and `/showcase` is clean with light loaded (no spec change expected; depends on US1 and T014).

**Checkpoint**: the example renders a fully styled default-light with a clean axe pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T016 [P] Add a `.changeset/*.md` declaring `@unbranded-ds/tokens` minor and `@unbranded-ds/react` minor.
- [x] T017 [P] Document the new canonical pair in `THEMING.md` (the token reference / destructive discussion) and the color-token list in `packages/tokens/README.md` if it enumerates them.
- [x] T018 Run the `humanizer` skill over the new prose (the changeset and the doc additions), then revise in place.
- [x] T019 Full local CI green: `pnpm typecheck && pnpm build && pnpm test:unit`, `pnpm exec tsx scripts/validate-sidecars.ts`, `pnpm --filter @unbranded-ds/storybook build`, and the example e2e.

---

## Dependencies & Execution Order

- **Setup (T001)**: the schema keys, first.
- **Foundational (T002–T006)**: the authored AA values across all six cells, then the build. Blocks every user story.
- **US1 (T007–T009) and US2 (T010–T013)**: both depend only on Foundational and live in different packages (react vs tokens), so they run in parallel. US1 is the MVP.
- **US3 (T014–T015)**: depends on US1 (the fixed Button) and Foundational (the build emitting the tokens).
- **Polish (T016–T019)**: after the stories; T018/T019 last.

### Parallel opportunities

- Foundational: T002 first (the canonical baseline), then T003, T004, T005 together (separate cell files); T006 after.
- Across stories: the entire US1 (react) block runs alongside the entire US2 (tokens) block.
- US1: T008 and T009 together after T007.
- US2: T011 and T012 together; T013 after T010.
- Polish: T016 and T017 together.

### Parallel example: Foundational palettes

```bash
Task: "Author + verify default-dark in themes/color-scheme/dark.json"
Task: "Author + verify brand-{light,dark} in themes/theme/brand/"
Task: "Author + verify vaporwave-{light,dark} in themes/theme/vaporwave/"
```

---

## Implementation Strategy

### MVP first

Setup + Foundational + US1. At that point the destructive Button is AA-legible across all six themes, verified empirically — the headline fix, shippable on its own.

### Incremental delivery

US1 (the legible button) → US2 (the durable validator guard) → US3 (re-enable the example's light scheme) → Polish (changeset, docs, humanizer, full CI).

### Notes

- `[P]` = different files, no incomplete dependency.
- The tokens build is intentionally red between T001 and T006 (required keys with no values yet); this resolves once the six cells are authored and built.
- Tests are required per the constitution (Section VI) and the token change; US2 is the durable guard. The changeset (T016) and a humanizer pass on new prose (T018) are both owed before merge.
- No constitution amendment: FR-004 grows the canonical schema by one pair, which Section III allows by spec (precedent: spec 008). The PR's Constitution Check should carry that note.
