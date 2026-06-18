# Spec 024 — Draft themes: built and validated, not yet published

**Target version:** `@unbranded-ds/tokens` (a build and packaging change; bump TBD)
**Depends on:** the expressivity-audit spike, which surfaced this; best landed before more fixtures pile up
**Blocks:** keeping in-progress and fixture skins out of the published package while they are still being shaped
**Status:** brief (not yet specified); needs a design decision, see Options. The spec number is provisional.

> Surfaced on 2026-06-18 while building the LCARS expressivity fixture. The validated theme pipeline (the Style Dictionary build and the `themes-contrast.test` contrast check) only operates on themes under `packages/tokens/themes/theme/<identity>/`. So a skin that should be built and AA-validated, which is what makes the expressivity fixtures and their a11y guard real, has to live in the published themes directory and ships to consumers on the next release even when it isn't ready. LCARS is the first case: a fixture, deliberately absent from the registry and `listThemes`, whose built `dist/css/tokens-lcars-*.css` ships anyway.

## The problem

A theme carries two properties we currently can't separate. It is _validated_ (built through the pipeline, contrast-checked), and it is _published_ (its CSS lands in `dist` and the package `files`). The expressivity model wants a middle state: a skin validated enough that its a11y guard is real, but held back from publish until it graduates to a registered product theme. By the experiment's own rule, that graduation happens when the skin reaches zero expressivity blockers.

The only knob today is presence in `themes/theme/`, which couples validation and publish. Registry membership is already decoupled (LCARS validates without appearing in `listThemes`), but publish is not.

## Options (needs a decision)

- A draft marker in place. Keep draft themes under `themes/theme/` but mark them (a naming convention like a leading underscore, or a small manifest field) so the build validates them and excludes their cells from `dist` and the package `files`.
- A separate source location. Draft and fixture themes live somewhere like `fixtures/themes/<skin>/` or `packages/tokens/themes-draft/`, and the build plus `themes-contrast.test` learn to validate that location too, while only `themes/theme/` publishes.
- Publish-time exclusion. Leave authoring where it is and drop specific cells from publish through build config or packaging rules, with an explicit list of which identities are draft.

Each option trades authoring ergonomics against how clearly "draft vs shipped" reads in the tree. The separate-location option matches how the expressivity fixtures already sit at the repo root; the in-place marker keeps one home for every theme. This is a clarify-cycle call, not a foregone conclusion.

## Why it's worth doing

The experiment will accumulate more fixtures (an enterprise grid, a glass console, and others). Each is a skin we want validated but not shipped until it is ready. Without a draft state, every new fixture quietly enlarges the published package, and "ship it when it's ready" has no mechanism behind it.

## References

- The spike (`kendrick/expressivity-spike`): the audit, the LCARS fixture, and the changeset that patches the tokens package for the shipped lcars cells.
- `packages/tokens/sd.config.ts` (theme discovery in the build), `packages/tokens/package.json` (the `files` allowlist), and `packages/tokens/src/themes-contrast.test.ts` (the per-cell contrast gate).
- LCARS as the first instance: built and validated, registry-absent, but published.
