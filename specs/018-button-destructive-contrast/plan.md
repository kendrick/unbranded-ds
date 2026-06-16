# Implementation Plan: Accessible destructive Button across every theme

**Branch**: `018-button-destructive-contrast` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-button-destructive-contrast/spec.md`

## Summary

The destructive Button renders the destructive color as text on a pale destructive tint, which is ~4.1:1 in the light cells — below WCAG AA. The fix introduces a canonical, reusable token pair — `destructive-subtle` (an opaque subtle destructive surface) and `destructive-subtle-foreground` (a darker destructive text color) — authored per cell across all six identity×scheme combinations so the pair clears 4.5:1, and points the Button's `destructive` variant at it. A new contrast pair in the schema guards the relationship for every cell, closing the gap where only the unused solid `destructive-foreground`/`destructive` pairing was checked. Once green, the example app re-enables its light scheme.

## Technical Context

**Language/Version**: TypeScript 5.x, strict, no `any` (Constitution VIII).
**Primary Dependencies**: Style Dictionary v4 (token build + per-cell CSS emission), Zod (`schema.ts` token schema + `contrastPairs`), the `color.ts` WCAG contrast math, Tailwind CSS v4 (`@theme` preset auto-maps tokens to utilities), `class-variance-authority` + `cn()` (the Button `destructive` variant), React 19, Storybook 10.3 (Button stories + addon-a11y), `@playwright/test` + `@axe-core/playwright` (example e2e a11y).
**Storage**: N/A. Tokens are build-time JSON compiled to CSS variables; no persisted runtime state.
**Testing**: Vitest units (`themes-contrast.test.ts` over `contrastPairs`, `schema.test.ts`, Button CVA), Storybook interaction + a11y, example Playwright axe pass.
**Target Platform**: The published `@unbranded-ds/tokens` and `@unbranded-ds/react` packages and any consuming web app; the in-repo example and Storybook.
**Project Type**: Design-system monorepo (tokens + react + storybook + example), three packages per Constitution I.
**Performance Goals**: N/A (build-time tokens; no runtime hot path changed).
**Constraints**: Every shipped identity×scheme cell (six) MUST pass the new pair at ≥4.5:1, and on the standard surfaces the button sits on (page background and card/muted). The dark cells, which already pass, must not regress. No `any`; no hardcoded colors in `packages/react/src/components/**` (lint rule).
**Scale/Scope**: Two new canonical color tokens × six cells (plus the canonical default), one new contrast pair, one Button variant, one example CSS import, one changeset. No NEEDS CLARIFICATION remain (resolved in the spec's Clarifications).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Section II (tokens independent of components)**: PASS. The pair lives in `@unbranded-ds/tokens`, emits as CSS variables, and the Button consumes it through Tailwind utilities — no runtime import of the tokens package into the component.
- **Section III (theming contract — schema locked, values float)**: PASS, with a note. Adding `destructive-subtle` and `destructive-subtle-foreground` grows the canonical token set. Section III locks the set at build time but the set has always grown by spec (precedent: spec 008 added `font-serif`, `ring`, `z-index`). This is a deliberate canonical-schema addition, not a redefinition of the theming model, so it needs **no constitution amendment** (unlike spec 016, which changed the axis model normatively). Both tokens are provided by every bundled cell and defaulted in the canonical baseline, so a partial consumer theme that omits them still resolves.
- **Section IV (components thin, token-styled, no hardcoded colors)**: PASS. The `destructive` variant swaps `bg-destructive/10 text-destructive` for `bg-destructive-subtle text-destructive-subtle-foreground` — still token-backed utilities, no hex/rgb/hsl literals.
- **Section VI (three test layers)**: PASS. The token pair joins the per-cell AA matrix unit test; the Button keeps its unit/interaction/a11y coverage and its destructive story now passes axe in light.
- **Section IX (definition of done for Button)**: PASS. Stories, a `play` function, zero serious/critical axe violations, exports, and autodocs all stay satisfied.
- **Section XI (agent + human legibility)**: PASS, no concessions. The new tokens are canonical (so the token map tags them `source: 'schema'`, queryable via the token-query MCP like any other), the validator failure stays the structured `CONTRAST_FAILURE` shape, and the prose (changeset, token docs) runs through the `humanizer` skill before merge. Three-item lists avoided.

No gate violations. Complexity Tracking is empty.

**Post-design re-check (after Phase 1)**: Unchanged. The data model (two canonical tokens + one contrast pair), the contract (additive token API, stable `destructive`/`destructive-foreground`, no new error code), and the quickstart introduce nothing that flips a gate. The canonical-schema growth remains the only governed item and stays within Section III's by-spec growth. Still PASS, no amendment.

## Project Structure

### Documentation (this feature)

```text
specs/018-button-destructive-contrast/
├── spec.md              # /speckit.specify + /speckit.clarify output
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (the token pair + the contrast pair)
├── quickstart.md        # Phase 1 output (how to verify the fix)
├── contracts/           # Phase 1 output (the token + Button-variant contract)
└── tasks.md             # /speckit.tasks output (NOT created here)
```

### Source Code (repository root)

```text
packages/tokens/
├── src/
│   ├── schema.ts                 # add destructive-subtle + -foreground to colorTokens; add the contrast pair to contrastPairs
│   ├── tokens/color.json         # the canonical default (default-light) values for the pair
│   ├── defaults.generated.ts     # regenerated by the build (committed)
│   └── themes-contrast.test.ts   # already iterates contrastPairs → covers the new pair across all six cells; add an explicit assertion
└── themes/
    ├── color-scheme/dark.json    # default-dark values for the pair
    └── theme/
        ├── brand/{light,dark}.json       # brand cells
        └── vaporwave/{light,dark}.json   # vaporwave cells

packages/react/
└── src/components/Button/
    ├── Button.tsx                # destructive variant → bg-destructive-subtle / text-destructive-subtle-foreground; drop the dark: overrides (per-cell tokens make them redundant)
    ├── Button.test.tsx           # assert the destructive variant's resolved classes
    └── Button.stories.tsx        # Destructive story now passes axe in light (no story change required, but verify)

examples/nextjs-15-app-router/
└── app/globals.css               # re-add the light.css import (the spec-016 workaround removed it)

.changeset/                        # new changeset: @unbranded-ds/tokens minor + @unbranded-ds/react minor
```

**Structure Decision**: This is the established design-system monorepo (Constitution I). The change is contained to the tokens package (the pair, its six authored values, the validator guard), the Button component in the react package (the one variant), the example app (re-enabling light), and a changeset. No new package, no new structure.

## Complexity Tracking

No constitution violations. The canonical-schema growth (Section III) is an allowed, precedented addition, not a violation, so it carries no justification debt.
