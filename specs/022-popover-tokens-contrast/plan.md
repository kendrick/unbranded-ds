# Implementation Plan: Popover tokens and the Dialog description contrast fix

**Branch**: `022-popover-tokens-contrast` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-popover-tokens-contrast/spec.md`

## Summary

Define the popover surface the design system's overlay components already reference but never declare. `Dialog`, `Tooltip`, and `Select` content all style themselves with `bg-popover` / `text-popover-foreground`, yet the color schema has no `popover` token, so those surfaces resolve to unset CSS variables and render transparent. That transparency, not the text color, is why the Storybook a11y gate measured the Dialog description at 3.98:1 against the overlay bleed-through.

Add `popover` and `popover-foreground` as canonical color tokens, authored per theme cell as a flat copy of that cell's `background` / `foreground` (elevation already comes from the components' ring and shadow). Because `muted-foreground` on `background` is already a validated AA pair, the description passes with no `muted-foreground` change. Guard two new contrast pairs across the theme matrix, then remove the spec-020 `color-contrast` quarantine from the two Dialog stories. One changeset: minor on `@unbranded-ds/tokens`, patch on `@unbranded-ds/react`.

## Technical Context

**Language/Version**: TypeScript 5.x, strict, no `any` (Constitution VIII). DTCG JSON token sources.  
**Primary Dependencies**: Style Dictionary v4 (the token build, `sd.config.ts`), Zod (the theme schema + `contrastPairs`), the `color.ts` WCAG contrast math, Tailwind CSS v4 (`@theme` preset auto-maps `--color-*` to utilities), `@modelcontextprotocol/sdk` (the token-query MCP reads the token map). No new dependencies.  
**Storage**: N/A — build-time DTCG JSON compiled to CSS variables, a Tailwind preset, JSON, and a typed token map. No runtime or persisted state.  
**Testing**: Vitest unit (`schema.test.ts`, `defaults.test.ts`, `themes-contrast.test.ts` matrix, `token-map` coverage) and the Storybook test-runner a11y gate on the un-quarantined Dialog stories (Constitution VI).  
**Target Platform**: the `@unbranded-ds/tokens` artifacts consumed by `@unbranded-ds/react` and any downstream app via the Tailwind preset.  
**Project Type**: design-token package (`packages/tokens`) plus a stories-only change in the component library (`packages/react`).  
**Performance Goals**: N/A — build-time token emission; no runtime path.  
**Constraints**: every shipped color-scheme × identity × density cell must stay WCAG AA (Constitution III); no component public-API or rendered-DOM change beyond the now-opaque surface the token supplies (FR-007); the canonical schema grows by spec, not ad hoc.  
**Scale/Scope**: 2 new tokens across 6 palette files; 2 new contrast pairs; 2 hand-authored token-map entries; generated artifacts regenerate from the build; 1 stories file de-quarantined; 1 changeset. No new package, no new component.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Section II (tokens independent of React)**: the change lives in `packages/tokens` DTCG sources, the Zod schema, and the token map. Nothing pulls React, Storybook, or Base UI into the tokens graph. A tokens-only consumer gets the new surface.
- [x] **Section III (theming: schema locked, values float, WCAG AA validated)**: this grows the canonical set by spec — the sanctioned mechanism, as in specs 008/016/018 — and keeps the lock honest by validating the two new pairs across the full matrix. `system` and the cascade layers are untouched. The new pair floats per theme like every other color.
- [x] **Section IV (components thin/unopinionated)**: no component changes; the components already reference the popover surface. The component set is unchanged.
- [x] **Section VI (three test layers)**: the token-level contrast unit test gains the two pairs across all six cells; the a11y story layer re-enforces on the two de-quarantined Dialog stories. Interaction tests are unaffected.
- [x] **Section VIII (tooling, strict TS, no `any`)**: Style Dictionary, Zod, and the existing contrast math, used as-is. No new tooling, no `any`.
- [x] **Section IX (DoD, SSR)**: a build-time token change with no runtime code, so SSR is unaffected. The Dialog/Tooltip/Select stories must pass axe with the quarantine gone.
- [x] **Section X (changeset + compliance)**: one `.changeset/*.md` declaring `@unbranded-ds/tokens` minor (additive token; partial consumer themes inherit, so non-breaking) and `@unbranded-ds/react` patch (consumer-visible opaque surface; the PR touches `packages/react`).
- [x] **Section XI.1 (prose humanized)**: the changeset and any new code comment (a short note on why popover equals background) are human-facing and pass the `humanizer` skill before merge.
- [x] **Section XI.2 (API shape)**: no new component props. `popover` / `popover-foreground` follow the existing `<surface>` / `<surface>-foreground` naming the schema already uses (`primary`/`primary-foreground`, `destructive-subtle`/`destructive-subtle-foreground`).
- [x] **Section XI.4 (structured failure output)**: theme validation already returns the typed `{ ok, issues }` shape; the new pair flows through it, so a missing or sub-AA popover surfaces a coded issue, not just prose.
- [x] **Section XI.3 (docs surfaces)**: the token-query MCP and the typed token map auto-expose the new tokens once they are in `token-map.ts`; no separate doc surface needs hand-editing.

No violations. Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/022-popover-tokens-contrast/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions grounded in the token build
├── data-model.md        # Phase 1 — the token pair, the contrast pairs, the cell matrix
├── quickstart.md        # Phase 1 — how to verify
├── contracts/
│   └── popover-token.md  # Phase 1 — the token + validation contract
└── tasks.md             # Phase 2 — created by /speckit.tasks
```

### Source Code (repository root)

```text
packages/tokens/
├── src/
│   ├── schema.ts                 # add `popover` + `popover-foreground` to colorTokens; add 2 contrastPairs (len 6 → 8)
│   ├── token-map.ts              # add color.popover + color.popover-foreground entries (source: 'schema')
│   ├── schema.test.ts            # update contrastPairs length assertion (6 → 8); any color-token-count assertion
│   ├── defaults.test.ts          # confirm regenerated defaults include the pair (compares generated to source)
│   ├── defaults.generated.ts     # AUTO-GENERATED — regenerated by the build, not hand-edited
│   ├── themes-contrast.test.ts   # NO edit — its loop derives from contrastPairs and covers the new pairs
│   └── tokens/
│       └── color.json            # default light base: add popover = background, popover-foreground = foreground
└── themes/
    ├── color-scheme/dark.json            # default dark: add the pair from this cell's background/foreground
    ├── theme/brand/light.json            # brand light: add the pair
    ├── theme/brand/dark.json             # brand dark: add the pair
    ├── theme/vaporwave/light.json        # vaporwave light: add the pair
    └── theme/vaporwave/dark.json         # vaporwave dark: add the pair

packages/react/
└── src/components/Dialog/Dialog.stories.tsx   # remove the color-contrast quarantine from the two stories

.changeset/<name>.md             # NEW — tokens minor, react patch

# Regenerated by `pnpm --filter @unbranded-ds/tokens build` (not hand-edited):
#   dist/tailwind/preset.css (gains --color-popover → bg-popover utility)
#   dist/css/tokens-*.css, dist/json/themes/*.json (resolved deltas), defaults.generated.ts
```

**Structure Decision**: Existing monorepo layout (Constitution I). The feature is almost entirely a `packages/tokens` change — schema, six palettes, token map, and the regenerated artifacts — with a single stories-only edit in `packages/react`. No new package or top-level directory. Any test that hard-codes a color-token or contrast-pair count is updated in the same pass.

## Complexity Tracking

No Constitution violations. Section not applicable.
