# Implementation Plan: Agent experience foundation

**Branch**: `005-agent-experience-foundation` | **Date**: 2026-05-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-agent-experience-foundation/spec.md`

## Summary

This spec ships four foundations for the agent experience: `AGENTS.md` at the repo root, the sidecar `*.usage.md` template plus retrofit onto all 14 currently shipped components, an autodoc audit across four prose surfaces (component-level descriptions, `argTypes` descriptions, story-level descriptions, TSDoc comments), and a stdio token-query MCP exposing four tools (`listThemes`, `palette`, `contrast`, `lookupToken`). Shared MCP infrastructure is extracted alongside the token-query implementation so the future `@unbranded-ds/react` MCP becomes a thin layer over existing primitives rather than a from-scratch effort.

The constitution amendment to 1.1.0 (adding Section XI "Agent and human legibility are co-equal") and the corresponding plan-template Constitution Check update were completed by a prior `/speckit.constitution` invocation on this branch and are prerequisites met, not work in this plan.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any` (Constitution Section VIII)

**Primary Dependencies (new)**:

- `@modelcontextprotocol/sdk` — Anthropic's TypeScript SDK for MCP servers. Used to build the stdio token-query MCP. Adding this requires extending Section VIII's tool list (small PATCH amendment to the constitution; addressed in this plan, see Constitution Check).
- A custom markdown code-block extractor + `tsc --noEmit` runner — small homegrown script (~100 lines) for the sidecar compile-test validator (FR-017a). No new npm dependency.

**Primary Dependencies (existing, in scope)**:

- `@unbranded-ds/tokens` — hosts the MCP server (no new package per Constitution Section I)
- `@unbranded-ds/react` — receives the 14 sidecar files and TSDoc edits
- `vitest` — adds the per-tool MCP unit tests and the sidecar validator smoke test
- `tsup` — builds the MCP binary entry on `@unbranded-ds/tokens`
- The existing `validateTheme` WCAG contrast math in `@unbranded-ds/tokens` — reused by the MCP's `contrast` tool

**Storage**: N/A. The MCP reads from the in-memory token map; sidecars are markdown files on disk.

**Testing**:

- Vitest unit tests for each MCP tool (with mocked inputs)
- Vitest unit tests for the shared MCP runtime primitives
- CI smoke test that spawns the stdio MCP and calls `tools/list`, asserting the four tools are present
- The sidecar compile validator runs in CI as part of the verify job; broken code blocks fail the build

**Target Platform**:

- The token-query MCP runs as a Node.js subprocess of an MCP client (Claude Code, Claude Desktop, Cursor, etc.)
- Sidecars are markdown files consumed by anyone with a local clone or via raw GitHub for a hosted view
- `AGENTS.md` is consumed by both humans and agents

**Project Type**: Mixed deliverable. The spec ships a documentation surface (`AGENTS.md`, sidecar template, 14 component sidecars), an audit pass on existing prose (stories.tsx + TSDoc), and a new runtime artifact (the MCP server binary on `@unbranded-ds/tokens`).

**Performance Goals**:

- MCP tool calls return in under 50ms for typical inputs (pure object access, no network, no I/O beyond reading the bundled tokens map at startup)
- The sidecar compile validator finishes in under 5 seconds for all 14 sidecars on a developer machine

**Constraints**:

- No new package (Constitution Section I) — the MCP lives inside `@unbranded-ds/tokens` as a binary entry
- Section XI legibility rules apply to every piece of prose this spec creates or edits
- One PR per component sidecar (FR-032) — 14 PRs for the retrofit alone
- Compile-test validator MUST gate the verify job (FR-017a)
- All structured warnings and MCP errors use the `{ component, issue, ... }` shape per Section XI.4 and the FR-034 pattern from spec 004

**Scale/Scope**:

- 1 `AGENTS.md` at the repository root
- 1 sidecar template at `packages/react/src/components/_template/Component.usage.md`
- 14 per-component sidecars (one for each shipped component)
- 4 prose surfaces audited across ~14 stories.tsx files plus the matching component `.tsx` source TSDoc
- 1 new MCP server with 4 tools and a shared runtime layer
- 1 sidecar compile validator script + CI integration
- 1 small constitution amendment (Section VIII tool list extension; PATCH bump from 1.1.0 to 1.1.1)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Constitution version at planning time: **1.1.0**, with a planned PATCH amendment to 1.1.1 inside this spec (adding `@modelcontextprotocol/sdk` to Section VIII's tool list — see the gate below).

| Section                               | Gate                                                 | Status             | Notes                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Repository shape                   | No new packages                                      | Pass               | MCP lives inside `@unbranded-ds/tokens` as a binary entry. Sidecars live inside `packages/react`. No new package.                                                                                                                                                                                                                                                         |
| II. Tokens independent of components  | Tokens has no React or Base UI runtime deps          | Pass               | The MCP SDK is a generic Node library, not React-related. The MCP runs as a separate process, not as a runtime dependency of consumers of `@unbranded-ds/tokens`'s npm package.                                                                                                                                                                                           |
| III. Theming contract                 | Theme schema unchanged                               | Pass               | The MCP queries the existing schema; it does not change the schema or theme runtime.                                                                                                                                                                                                                                                                                      |
| IV. Components thin and unopinionated | No source changes beyond TSDoc prose                 | Pass               | FR-030 (revised during clarify) allows TSDoc edits but forbids behavior or API changes. No CVA, no styling, no slot changes.                                                                                                                                                                                                                                              |
| V. Stories source of truth            | Stories prose may be edited; behavior unchanged      | Pass               | The audit edits `argTypes` and story-level descriptions only. No story args, no play function changes.                                                                                                                                                                                                                                                                    |
| VI. Testing — three layers            | Adds smoke + unit tests for the MCP                  | Pass               | Storybook test-runner and a11y layers unaffected.                                                                                                                                                                                                                                                                                                                         |
| VII. Deployment and MCP               | New MCP must be CI-smoke-tested                      | Pass               | FR-029a adds the smoke test. The MCP is stdio-based, so the smoke test spawns the subprocess locally in CI rather than calling a hosted endpoint.                                                                                                                                                                                                                         |
| VIII. Tooling baseline                | Adds `@modelcontextprotocol/sdk`                     | Pass via amendment | Section VIII currently lists `@storybook/addon-mcp` only. Adding the SDK requires a PATCH amendment that extends the MCP entry. The amendment is part of this spec's deliverables (see Phase 0 research).                                                                                                                                                                 |
| IX. DoD per component                 | No new component                                     | Pass               | No new components in this spec. The retrofit adds sidecars and audits prose; it does not introduce or modify the nine DoD gates for component PRs.                                                                                                                                                                                                                        |
| X. Governance                         | Constitution Check + per-PR changeset                | Pass               | This branch already amends the constitution to 1.1.0. The PATCH amendment to 1.1.1 lands in the same branch. Each MCP-related change to `packages/tokens` gets a `@unbranded-ds/tokens: minor` changeset (MCP is a new feature). Sidecar-only PRs touching `packages/react/src/components/<Component>/` get a `@unbranded-ds/react: patch` changeset (docs-only changes). |
| XI. Agent and human legibility        | This spec operationalizes XI; passes by construction | Pass               | Every artifact is the implementation of one or more Section XI subsections.                                                                                                                                                                                                                                                                                               |

- [x] Section XI — does this change keep prose, API shape, docs surfaces, failure modes, and story coverage legible to both agents and humans? Yes — the spec adds new surfaces (sidecars, AGENTS.md, token-query MCP) that are explicitly dual-audience, and the autodoc audit improves the existing autodocs surface. No concessions.

**No unjustified violations. One planned PATCH constitution amendment (Section VIII extension) is bundled into this spec's work.**

## Project Structure

### Documentation (this feature)

```text
specs/005-agent-experience-foundation/
├── plan.md                    # This file
├── spec.md                    # Feature specification (clarified)
├── research.md                # Phase 0 output — decisions captured here
├── data-model.md              # Phase 1 output — sidecar shape, MCP tool shapes
├── quickstart.md              # Phase 1 output — consumer onboarding
├── contracts/                 # Phase 1 output
│   ├── token-query-mcp.md     # MCP server contract: 4 tools + runtime layer
│   ├── sidecar-shape.md       # Sidecar markdown structure contract
│   └── agents-md-shape.md     # AGENTS.md structure contract
├── checklists/
│   └── requirements.md        # Spec quality checklist (passing)
└── tasks.md                   # Phase 2 output, created by /speckit.tasks
```

### Source Code (repository root)

```text
AGENTS.md                                # NEW — repo-root index, peer to README.md

.specify/memory/constitution.md          # PATCH amendment to 1.1.1 (Section VIII extension)

packages/tokens/
├── package.json                         # add `@modelcontextprotocol/sdk` devDep; add `bin` entry for the MCP
└── src/mcp/                             # NEW — token-query MCP
    ├── server.ts                        # binary entry; wires the runtime + tools
    ├── tools/
    │   ├── listThemes.ts
    │   ├── palette.ts
    │   ├── contrast.ts
    │   └── lookupToken.ts
    ├── runtime/                         # NEW — shared MCP infrastructure (FR-029b)
    │   ├── stdio.ts                     # stdio transport harness
    │   ├── errors.ts                    # structured error helpers per FR-027 and Section XI.4
    │   └── testing.ts                   # smoke + unit test scaffolding
    ├── tools/*.test.ts                  # per-tool unit tests
    ├── runtime/*.test.ts                # runtime primitive tests
    ├── smoke.test.ts                    # tools/list smoke test (FR-029a)
    └── index.ts                         # re-exports for runtime consumers

packages/react/src/components/
├── _template/                           # NEW — sidecar template (FR-007 through FR-010a)
│   └── Component.usage.md
├── Button/Button.usage.md               # NEW — one per shipped component (FR-011)
├── Card/Card.usage.md                   # NEW
├── Checkbox/Checkbox.usage.md           # NEW
├── Dialog/Dialog.usage.md               # NEW
├── Input/Input.usage.md                 # NEW
├── Label/Label.usage.md                 # NEW
├── SegmentedControl/SegmentedControl.usage.md   # NEW (compound — slot subsections per FR-010a)
├── Select/Select.usage.md               # NEW
├── SkipLink/SkipLink.usage.md           # NEW
├── Slider/Slider.usage.md               # NEW (compound — slot subsections per FR-010a)
├── Switch/Switch.usage.md               # NEW
├── Tabs/Tabs.usage.md                   # NEW (compound — slot subsections per FR-010a)
├── Tooltip/Tooltip.usage.md             # NEW (compound — slot subsections per FR-010a)
└── VisuallyHidden/VisuallyHidden.usage.md  # NEW

packages/react/src/components/<Component>/<Component>.stories.tsx   # AUDIT — humanizer pass on argTypes, component-level, and story-level descriptions
packages/react/src/components/<Component>/<Component>.tsx           # AUDIT — humanizer pass on TSDoc comments (FR-030 revised: prose-only edits allowed)

scripts/
└── validate-sidecars.ts                 # NEW — markdown code-block extractor + tsc runner

.github/workflows/ci.yml
├── + step: run validate-sidecars.ts in the verify job
└── + step: spawn the tokens MCP and run tools/list smoke test in the verify job (FR-029a)

.changeset/
├── add-tokens-mcp.md                    # @unbranded-ds/tokens: minor
├── add-react-sidecars-*.md              # @unbranded-ds/react: patch (one per sidecar PR per FR-032)
└── (audit changeset folded into stories.tsx commits where touched)
```

**Structure Decision**: The MCP lives inside `@unbranded-ds/tokens` as `src/mcp/` with the binary entry exposed via the package's `bin` field. The sidecars live alongside their existing component sources inside `packages/react`. `AGENTS.md` is at the repo root. The sidecar template lives at `packages/react/src/components/_template/Component.usage.md` (the underscore prefix marks it as a non-shipping reference). The compile validator lives at `scripts/validate-sidecars.ts` and runs from CI.

Each sidecar lands as its own PR per FR-032. Each sidecar PR adds a `@unbranded-ds/react: patch` changeset (sidecar-only changes are documentation, not behavior or API). The MCP work lands as a separate PR (or chain) with a `@unbranded-ds/tokens: minor` changeset. The audit work touches stories.tsx and `.tsx` source TSDoc; whether that's one bulk PR or one per component is decided in tasks.md.

## Complexity Tracking

No violations to track. The constitution amendment for the MCP SDK is small and self-justifying — Section VIII is a tool list, and new tool additions are routine PATCH bumps per the precedent set by spec 003.
