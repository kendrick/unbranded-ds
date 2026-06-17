# Phase 0 Research: z-index resolution in the Storybook test-runner

## The question

The `TooltipStacksAboveDialog` play reads `getComputedStyle(el).zIndex` on the tooltip and dialog content and asserts the tooltip's stop is above the dialog's. In the Vitest browser-mode runner both reads return `auto` → `NaN` → the assertion throws, so spec 019 quarantined the story with `tags: ['!test']`. How do we make those reads return the real stops (60 and 50) in the runner, without changing the tokens, the components, or how dev and prod render, and without a test-only copy of the values (clarification Q3)?

## What the build actually does

- **The concrete stops live in the generated token CSS.** `packages/tokens/dist/css/tokens-light.css` (and the other `tokens-*.css`) define `--z-index-overlay: 50; --z-index-popover: 55; --z-index-tooltip: 60; --z-index-max: 9999;`, scoped under `[data-color-scheme="<scheme>"]` inside `@layer ds-color-scheme`.
- **The preview already imports those files.** `import '@unbranded-ds/tokens/themes/light.css'` resolves through the tokens `exports` map (`"./themes/*.css": "./dist/css/tokens-*.css"`) to exactly those generated files. So the concrete values are in the test bundle already — both the `--color-*` and the `--z-index-*` custom properties.
- **The components consume the stops via Tailwind arbitrary properties.** `z-(--z-index-tooltip)` (Tooltip), `z-(--z-index-overlay)` (Dialog overlay and content), `z-(--z-index-max)` (SkipLink), `z-(--z-index-popover)` (Select). Each compiles to `z-index: var(--z-index-<stop>)`.
- **The preset maps but does not emit.** `@unbranded-ds/tokens/preset.css` (= `dist/tailwind/preset.css`) declares the stops in `@theme inline { --z-index-*: var(--z-index-*); }`. The `inline` form maps the utility namespace without emitting `:root` values, so the cascade values come only from the imported token CSS above.
- **The test config differs from dev/build on Tailwind wiring.** `apps/storybook/.storybook/main.ts` adds `@tailwindcss/vite` in `viteFinal`. `apps/storybook/vitest.config.ts` configures the `storybook` browser project through `storybookTest()` but does not itself add the Tailwind vite plugin, so whether the runner runs the same Tailwind content pass as dev is the open variable.

## Decision

Make the test environment's Tailwind/CSS pipeline emit the `z-(--z-index-*)` declarations so the already-imported concrete values resolve. The source of truth stays the generated token CSS; the fix introduces no z-index values of its own.

The exact gap is confirmed empirically during implementation (systematic debugging), because two hypotheses both fit the "colors resolve but z-index is `auto`" symptom and imply slightly different one-line fixes:

- **Leading hypothesis — the Tailwind content scan misses the arbitrary utilities.** Named color utilities (`bg-popover`) are generated in the runner, so colors resolve; the arbitrary `z-(--z-index-*)` utilities are not detected, so no `z-index` rule is emitted and the element computes `auto`. Fix direction: ensure the runner runs `@tailwindcss/vite` with `packages/react/src/**` in its content scan — e.g. add the Tailwind vite plugin to `apps/storybook/vitest.config.ts` (the `storybookTest()` project may not inherit `main.ts`'s `viteFinal`), or add an explicit `@source` for the component source to the test-loaded CSS.
- **Fallback hypothesis — the axis attribute is absent on the render root.** If `data-color-scheme` is not applied in the runner, the `[data-color-scheme]`-scoped block (colors and z-index together) would not resolve. Lower probability, because colors scoped in that same block do resolve. If confirmed, fix direction: apply the axis attributes in the test setup the way the preview decorator and the flash-free bootstrap do in dev.

First implementation step is to reproduce and observe: remove `!test`, run `vitest run --project storybook`, and inspect (a) whether a `.z-\(--z-index-tooltip\)` rule exists in the runner's stylesheet and (b) whether `--z-index-tooltip` resolves on the element. That observation selects between the two fixes.

## Rationale

- **Q3 / FR-008**: the concrete stops already ship in `dist/css/tokens-*.css` and are already imported, so the fix only needs to make them apply. No hand-authored copy, no drift.
- **FR-004 / FR-005**: touching only `apps/storybook` test config leaves the tokens, the Dialog and Tooltip components, and the dev/prod rendering untouched.
- **FR-006**: both candidate fixes resolve the whole `z-(--z-index-*)` category at once — the content scan emits every arbitrary utility, the axis attribute unlocks every scoped var — so SkipLink and Select benefit by construction with no separate work.

## Alternatives rejected

- **Hardcode `--z-index-*` in `vitest.setup.ts`** (a test-only `<style>` or JS injection): violates Q3 / FR-008 and creates a second source of truth that drifts from the tokens.
- **Add the stops to the per-theme token source or the preset**: changes the published artifacts and how dev/prod resolve (FR-004 / FR-005), and exceeds the brief's test-env-only, don't-re-architect guardrail.
- **Run the gate in jsdom instead of a browser**: jsdom cannot compute layout or contrast (the a11y gate needs a real browser anyway, per spec 019), and `getComputedStyle().zIndex` would not behave like a real engine.
- **Commit a permanent always-failing "inverted" test for US2**: rejected per clarification Q1 — the token-ordering invariant is already guarded by `defaults.test.ts`, so US2 is a one-time manual verification.

## Resolution (from implementation, 2026-06-16)

The empirical diagnosis (T003) overturned both hypotheses above. The runner does run Tailwind, the token CSS is loaded, and `data-color-scheme` is applied — yet no design system token resolved. Colors, spacing, and z-index all came back empty; the suite passed only because interaction tests check behavior and axe had been scoring contrast against unstyled defaults.

**Actual root cause: cascade layer order.** `preview.ts` imports the token CSS before Tailwind, so the `ds-color-scheme` / `ds-theme` / `ds-density` layers are established first and rank below Tailwind's `theme` layer. The preset's `@theme inline` emits `:root, :host { --token: var(--token); }` into that higher-priority `theme` layer; the self-reference resolves to empty and shadows the real values in the lower `ds-*` layers. So every token fell back to empty, not just z-index — z-index was just the one the quarantined test happened to read.

**Fix:** a test-only `apps/storybook/.storybook/_test-layer-order.css` declaring the full order (`@layer theme, base, components, utilities, ds-color-scheme, ds-theme, ds-density;`), imported first in `vitest.setup.ts` so the `ds-*` layers rank last (highest priority) and the real values win. Values still come from the generated token CSS, so Q3 / FR-008 hold; the change stays out of `preview.ts`, so dev and prod are untouched (FR-005).

**Consequence (re FR-009):** making tokens resolve made axe compute real contrast for the first time, which caught a genuine pre-existing failure — `DialogDescription`'s `muted-foreground` text at 3.98:1, alongside undefined `--color-popover` tokens. Per the scope decision, spec 020 ships the layer-order fix and the z-index re-enable, and quarantines only the `color-contrast` rule on the two affected Dialog stories, tracked in `docs/workshops/2026-06-16/spec-022-popover-tokens-and-dialog-contrast.md`. FR-009 held everywhere except those two, which are quarantined rather than left red.
