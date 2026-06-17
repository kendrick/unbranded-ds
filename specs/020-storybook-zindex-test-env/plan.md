# Implementation Plan: Nested-overlay stacking regression runs in the Storybook test-runner

**Branch**: `020-storybook-zindex-test-env` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-storybook-zindex-test-env/spec.md`

## Summary

Re-enable the quarantined `TooltipStacksAboveDialog` interaction test so the spec-010 nested-overlay stacking guarantee is gated on every pull request. The story's play reads `getComputedStyle().zIndex` on the tooltip and dialog content; in the Vitest browser-mode runner those reads return `auto`, so the assertion throws and spec 019 tagged the story `['!test']`. The fix makes the `z-(--z-index-*)` declarations resolve in the test environment, sourcing the concrete values from the generated token CSS the preview already imports (`@unbranded-ds/tokens/themes/*.css` → `dist/css/tokens-*.css`), with no test-only copy, then removes the quarantine tag. Test environment and test config only; no token, component, or stacking-behavior change.

## Technical Context

**Language/Version**: TypeScript 5.x, strict, no `any` (Constitution VIII)
**Primary Dependencies**: Vitest 3 (browser mode), `@vitest/browser` + `playwright` (Chromium), `@storybook/addon-vitest` (`storybookTest()`), `@storybook/addon-a11y`, Storybook 10.3 `@storybook/react-vite`, Tailwind CSS v4 (`@tailwindcss/vite`; the preset's `@theme inline` block)
**Storage**: N/A — test config; no runtime or persisted state
**Testing**: Storybook interaction (`play`) + a11y (axe) via the Vitest browser-mode runner (`@unbranded-ds/storybook` → `vitest run --project storybook`); the tokens unit suite (`defaults.test.ts`) already guards the z-index ordering invariant
**Target Platform**: CI (GitHub Actions) headless Chromium and local `vitest` browser mode
**Project Type**: Monorepo — `apps/storybook` test config plus one `packages/react` story-tag edit
**Performance Goals**: N/A — the story rides the existing storybook test job
**Constraints**: Values derive from the generated token build, no hardcoded test-only z-index (Q3 / FR-008); no change to tokens, Dialog/Tooltip, or dev/prod rendering (FR-004 / FR-005); no regression of any currently-green story (FR-009)
**Scale/Scope**: One quarantined story re-enabled; the fix resolves the whole `z-(--z-index-*)` category by construction (FR-006)

## Constitution Check

*GATE: applicable gates from constitution 1.4.0. Re-checked after Phase 1 below.*

- [x] **Section V / XI.5 — Stories are the dual-audience contract.** This re-enables a quarantined regression story, removing a behavior currently invisible to the running gate (and so to both agents and humans). It strengthens story coverage; it does not weaken it.
- [x] **Section VI — Three test layers in CI.** The interaction and a11y gate (VI.2, VI.3) already runs from spec 019; this restores one story to it. No layer is removed or loosened.
- [x] **Section XI (REQUIRED gate) — Agent and human legibility.** Prose: the only human-facing prose is code comments — the stale quarantine comment is removed, and any new comment explaining the test-env fix goes through the `humanizer` skill before merge. API shape, docs surfaces: unchanged. Failure modes: FR-007 keeps a failing run naming the story and assertion (agent-legible). Story coverage: improved. No concessions.
- [x] **Section VIII — Tooling baseline.** Uses the existing Vitest browser-mode and Tailwind v4 stack; no new dependency, no substitution.
- [x] **Section I — Repo shape.** No new package.
- [x] **Section X — Per-PR changeset (requires action).** The PR edits `packages/react/src/components/Dialog/Dialog.stories.tsx` (removing `!test`), and `changeset-check.yml` detects any `^packages/(tokens|react)/` diff. A changeset file IS required. Stories are not in the published bundle (`files: ["dist"]`), so no version bump: add an EMPTY changeset (`---\n---` frontmatter), following spec 019's `.changeset/storybook-test-runner-gate.md`. This corrects the spec's "no changeset" assumption — see Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/020-storybook-zindex-test-env/
├── plan.md          # this file
├── research.md      # Phase 0: root-cause hypotheses + mechanism decision
├── data-model.md    # Phase 1: no data entities (test config); fixture notes
├── quickstart.md    # Phase 1: how to verify the re-enabled gate
└── checklists/
    └── requirements.md   # spec quality checklist (from /speckit.specify)
```

No `contracts/` — this is internal test configuration with no external interface.

### Source Code (repository root)

```text
apps/storybook/
├── vitest.config.ts              # the storybook test project (browser mode); no @tailwindcss/vite plugin today
└── .storybook/
    ├── main.ts                   # stories globs + viteFinal(tailwindcss())
    ├── preview.ts                # imports @unbranded-ds/tokens/themes/*.css then styles.css
    ├── styles.css                # @import 'tailwindcss'; @import '@unbranded-ds/react/preset.css'
    └── vitest.setup.ts           # setProjectAnnotations + browser shims
                                  # ↑ the fix lands in one or more of these test-config files

packages/react/src/components/Dialog/
└── Dialog.stories.tsx            # remove tags: ['!test'] and the stale quarantine comment

packages/tokens/dist/css/tokens-*.css   # (generated) source of the concrete --z-index-* values; NOT edited

.changeset/
└── <new-empty-changeset>.md      # empty frontmatter; satisfies changeset-check.yml, no version bump
```

**Structure Decision**: The change is confined to `apps/storybook` test configuration, the single `Dialog.stories.tsx` tag removal, and an empty changeset. No component, token, or preset source is modified.

## Complexity Tracking

| Item | Why it is needed | Why the simpler path was rejected |
|------|------------------|-----------------------------------|
| Empty changeset despite the spec's "no changeset" assumption | `changeset-check.yml` fails any PR with a `packages/react/**` diff and no `.changeset/*.md`, and removing `!test` edits a story file there | "Add nothing" fails CI; a real (non-empty) changeset would bump `@unbranded-ds/react` for a story-only change that ships no bundle difference. The empty changeset satisfies the gate with no version bump, matching spec 019's precedent. |
