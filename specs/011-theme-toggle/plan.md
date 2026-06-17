# Implementation Plan: Theme controls (provider, hook, and per-axis toggles)

**Branch**: `011-theme-toggle` | **Date**: 2026-06-13 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-theme-toggle/spec.md`

## Summary

Ship the for-coleman theme-control pattern, reframed for the two-axis theming the system gained in spec 009. The load-bearing piece is an axis-agnostic `useTheme()` hook behind a `ThemeProvider`: the provider is the single source of truth and the home for per-axis `defaults` and `forced` (pinning), and the hook exposes per-axis `preference`/`resolved`/`system`/`forced`/`available` plus one object-valued `set(partial)`. On top sit two thin, named sibling controls. `<ThemeToggle>` is a fixed light/system/dark color-scheme control over the aesthetic axis; `<DensityToggle>` is data-driven from `available.density`. Vocabulary tracks `next-themes` where concepts map one-to-one and renames only where the multi-axis shape forces it, documented as a first-class deliverable. We build our own provider (no `next-themes` runtime dependency, since it is single-axis). The spec-002 bootstrap stays frozen and flash-free because a `system` preference persists its resolved `light`/`dark` to the bootstrap key while the `system` intent rides a companion key.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any`
**Primary Dependencies**: React (peer; uses `useSyncExternalStore`), `@base-ui-components/react` (peer, reached via SegmentedControl), `lucide-react` ^1.8.0 (Sun/SunMoon/Moon icons, existing dep), `class-variance-authority` + `cn()` (existing), the `SegmentedControl` primitive (spec 004), `@unbranded-ds/tokens` runtime (storage-key constants, the `Axis` union, and a NEW "themes per axis" registry export). No `next-themes` runtime dependency (vocabulary alignment only).
**Storage**: `localStorage`. Existing keys `unbranded-ds-theme` (now always holds a concrete theme) and `unbranded-ds-density`, plus one NEW companion key for the color-scheme `system` intent (working name `unbranded-ds-theme-preference`). Sidecars are markdown files on disk.
**Testing**: Vitest with `renderHook` (hook + provider), a `matchMedia` mock (the media-query path), and the existing `__ssr__` harness (no-`window` render); Storybook `play` functions (interaction); `@storybook/addon-a11y` + test-runner (axe). The story-level live-OS-change interaction is driven through the test-runner's media emulation.
**Target Platform**: Browsers, plus SSR hosts (Next.js, Remix) with no `window`/`localStorage` access at render.
**Project Type**: Component library (`packages/react`) plus a small runtime export in `packages/tokens`.
**Performance Goals**: OS color-scheme change reflected within one frame while at `system` (SC-002); no first-paint flash (SC-001); no layout shift on the toggles at hydration (FR-008).
**Constraints**: SSR-safe; flash-free against the unchanged spec-002 bootstrap; axe zero serious/critical; ESM only; styling resolves through tokens (the toggles inherit SegmentedControl's token styling and add no hardcoded values); no `next-themes` runtime dependency.
**Scale/Scope**: One provider, one hook, two components, one shared private `AxisToggle`, one tokens-package registry export, plus stories, unit tests, sidecars, and an `AGENTS.md` index entry.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Evaluated against constitution 1.3.0. All applicable gates pass.

- [x] **Section I (Repository shape)** — No new package. Work lands in `packages/react` (provider, hook, two components) plus one runtime export added to `packages/tokens`. Within the three-package shape.
- [x] **Section II (Tokens independent of components)** — The new "themes per axis" export is pure data over the existing token map and `Axis` union, with no React, Storybook, or Base UI in its graph. A tokens-only consumer is unaffected.
- [x] **Section III (Theming contract)** — Consumes the two-axis system (`data-theme`, `data-density`) unchanged. First-paint no-flash is preserved: the bootstrap key always holds a concrete theme, so the unchanged spec-002 bootstrap never encounters `system`. `validateTheme` and the cascade-layer composition are untouched.
- [x] **Section IV (Components thin; set additions need a spec)** — `<ThemeToggle>` and `<DensityToggle>` are new components, and this spec is their written justification. Both are thin shells over `SegmentedControl` + `useTheme`, introduce no hardcoded color/spacing/radius, and style through the inherited token utilities.
- [x] **Section V (Stories are the source of truth)** — Each toggle ships `Default` plus the SegmentedControl bar of variant stories (sizes, orientations, forced/disabled, custom labels/icons) and its behavioral stories, and a `Theming` story group surfaces `useTheme` + `<ThemeProvider>` with a compositional multi-axis story so the hook and provider reach Storybook and the MCP. Every story wraps in a `<ThemeProvider>` decorator. The full matrix is in the Storybook coverage section.
- [x] **Section VI (Testing: three layers)** — Unit (hook storage / matchMedia / SSR / `set(partial)` / forced; provider defaults / forced / two-consumer sync), interaction (`play`), and a11y (axe). Tests target our wrapper logic, not SegmentedControl's keyboard baseline, which spec 004 already covers.
- [x] **Section VII (Deployment / MCP)** — New stories flow to the Storybook MCP automatically; no MCP contract breaks. Surfacing the new tokens export in the token-query MCP is optional and out of scope here.
- [x] **Section VIII (Tooling baseline)** — No new tooling. TypeScript strict / no-`any`, `tsup` ESM, Tailwind tokens, `cva`, `cn`, `lucide-react` (existing). State uses React's built-in `useSyncExternalStore`. No amendment needed.
- [x] **Section IX (Definition of done)** — Each component ships `index.ts` / `*.tsx` / `*.stories.tsx` / `*.test.tsx`, tokens-only styling, the full story set, a `play`, axe-clean stories, an SSR-safe render, autodocs, and a root export. The hook and provider ship with unit tests, TSDoc, a sidecar, and root exports.
- [x] **Section X (Governance)** — A `.changeset/*.md` declares the `@unbranded-ds/react` (minor: new exports) and `@unbranded-ds/tokens` (minor: new export) bumps. This Constitution Check travels in the PR.
- [x] **Section XI (Agent and human legibility)** — required gate:
  - **XI.1 Prose** — Spec prose already passed the humanizer; sidecars, TSDoc, and story descriptions will too, with no three-item-list tic.
  - **XI.2 API shape** — Compat-first. The toggles inherit SegmentedControl's `size`/`orientation`. The hook and provider introduce the multi-axis surface, so their names track `next-themes` (the upstream analog) where a concept maps one-to-one (`forced`, `system`, `set`) and rename only where multi-axis forces it (`preference`, `resolved`). The full mapping is documented (FR-020). A deliberate, documented divergence, not a bespoke vocabulary.
  - **XI.3 Docs surfaces** — `*.usage.md` sidecars for both toggles (validated by the spec-005 validator) and a `useTheme.usage.md`; the alignment note (why multi-axis and provider, with links to specs 002, 009, 014) lives in the hook sidecar and TSDoc; `AGENTS.md` gains the new entries.
  - **XI.4 Failure modes** — Structured output: `THEME_INVALID_VALUE`, `THEME_AXIS_FORCED`, and `THEME_NO_SYSTEM_SOURCE` warn through the existing `warn()` helper and no-op; `THEME_NO_PROVIDER` throws a structured error. Each carries a stable code an agent can match.
  - **XI.5 Story coverage** — Every behavior above is exercised in a story, so it is visible to humans in Storybook and to agents through the MCP.

## Project Structure

### Documentation (this feature)

```text
specs/011-theme-toggle/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── useTheme.md          # hook return shape + next-themes mapping
│   ├── ThemeProvider.md     # provider props (defaults, forced)
│   ├── toggles.md           # ThemeToggle + DensityToggle props
│   ├── failures.md          # THEME_* codes and throw-vs-warn
│   └── tokens-registry.md   # the "themes per axis" export
├── checklists/
│   └── requirements.md  # from /speckit.specify
└── tasks.md             # Phase 2 output (/speckit.tasks, NOT created here)
```

### Source Code (repository root)

```text
packages/react/src/
├── hooks/
│   └── useTheme/
│       ├── index.ts                 # exports ThemeProvider, useTheme, types
│       ├── ThemeProvider.tsx        # provider: defaults + forced config, single source of truth
│       ├── useTheme.ts              # the hook (reads provider context)
│       ├── themeStore.ts            # useSyncExternalStore store: localStorage + matchMedia subscription
│       ├── resolve.ts               # preference -> resolved (system -> light/dark), per axis
│       ├── types.ts                 # Axis-keyed preference/resolved/forced/available + set()
│       ├── useTheme.test.tsx        # unit: storage, matchMedia sub/cleanup, SSR, set(partial), forced, codes
│       ├── Theming.stories.tsx      # 'Theming' group: Playground, Composition (multi-axis), ProviderConfig
│       └── useTheme.usage.md        # sidecar: next-themes translation + the why-multi-axis alignment note
├── components/
│   ├── _internal/
│   │   └── AxisToggle.tsx           # private shared shell over SegmentedControl + useTheme (not exported)
│   ├── ThemeToggle/
│   │   ├── index.ts
│   │   ├── ThemeToggle.tsx          # fixed light/system/dark over the aesthetic axis
│   │   ├── ThemeToggle.stories.tsx
│   │   ├── ThemeToggle.test.tsx
│   │   └── ThemeToggle.usage.md
│   └── DensityToggle/
│       ├── index.ts
│       ├── DensityToggle.tsx        # data-driven from available.density
│       ├── DensityToggle.stories.tsx
│       ├── DensityToggle.test.tsx
│       └── DensityToggle.usage.md
└── index.ts                         # + export * from hooks/useTheme, ThemeToggle, DensityToggle

packages/tokens/src/
├── axes.ts                          # existing Axis union + AXIS_ATTRIBUTE (unchanged)
├── runtime.ts                       # existing storage-key constants + bootstrap (unchanged)
└── registry.ts                      # NEW: themesForAxis(axis) -> built-in values incl. file-less default, + runtime-registered

AGENTS.md                            # + index entries for useTheme, ThemeToggle, DensityToggle
.changeset/                          # + a changeset: @unbranded-ds/react minor, @unbranded-ds/tokens minor
```

**Structure Decision**: The provider and hook live together under `packages/react/src/hooks/useTheme/` because they are one unit (the hook is meaningless without its provider), with the `useSyncExternalStore` store and the resolve logic split into siblings for unit-testability. The two toggles are ordinary components under `packages/react/src/components/`, each with the full spec-IX file set; their shared wiring lives in a private `components/_internal/AxisToggle.tsx` that is never exported, so the public surface is exactly the two named toggles. The only `packages/tokens` change is a new `registry.ts` export, keeping that package React-free per Section II.

## Storybook coverage

Matching the bar SegmentedControl sets (Default, Sizes, Orientations, Disabled, plus behavioral and keyboard stories). Every story renders inside a `<ThemeProvider>` decorator, since the toggles throw `THEME_NO_PROVIDER` without one. Every story is axe-clean (zero serious or critical), per Section VI.

`Components/ThemeToggle` (`ThemeToggle.stories.tsx`):

- `Default` — three segments, system selected, with a `play` that selects dark and asserts the applied scheme.
- `SystemFollowing` — a `play` drives a `prefers-color-scheme` change through the test-runner's media emulation and asserts `resolved` flips live without a storage write.
- `Sizes` — sm / md / lg stacked.
- `Orientations` — horizontal and vertical.
- `Forced` — under a `forced={{ aesthetic: 'dark' }}` provider, the control renders disabled.
- `AestheticIsBrand` — aesthetic set to `brand`, so no segment is selected and the control stays enabled.
- `CustomLabelsAndIcons` — overridden `labels` and `icons`.

`Components/DensityToggle` (`DensityToggle.stories.tsx`):

- `Default`, `Sizes`, `Orientations`, `Forced`, `CustomLabelsAndIcons` — the same shape on the density axis.
- `DataDrivenValues` — registers a theme on the density axis so a new segment appears, proving the `available`-driven rendering (FR-012).

`Theming` (`hooks/useTheme/Theming.stories.tsx`):

- `Playground` — a demo component reading `resolved` / `preference` and calling `set(partial)`, so `useTheme` is introspectable in the MCP; autodocs carry the next-themes mapping table.
- `Composition` — `<ThemeToggle>` and `<DensityToggle>` side by side over one provider, with the live `resolved` pair shown, so a combination such as vaporwave plus compact visibly emerges from two independent controls (US3). This is the multi-axis story.
- `ProviderConfig` — `defaults` and `forced` demonstrated.

## Complexity Tracking

No constitution violations. No entries.
