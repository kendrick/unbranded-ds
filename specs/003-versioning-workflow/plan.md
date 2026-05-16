# Implementation Plan: Versioning and release workflow

**Branch**: `003-versioning-workflow` | **Date**: 2026-05-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification at [/specs/003-versioning-workflow/spec.md](./spec.md)

## Summary

Adopt `@changesets/cli` as the canonical versioning and changelog workflow for the unbranded-ds monorepo. Replace the hand-authored per-release CHANGELOG approach that 0.2.0 shipped under with a per-PR markdown-file workflow that aggregates into auto-generated CHANGELOGs and version bumps at release time. CI enforces changeset presence on PRs touching `packages/`, the official `changesets/action` GitHub Action opens "Version Packages" PRs on push to `main`, and an NPM_TOKEN secret authenticates the publish step.

The technical approach: install `@changesets/cli` at the workspace root, drop a `.changeset/config.json` configured for the pnpm two-package monorepo, add two GitHub Actions workflow files (one for PR changeset-presence validation, one for the release pipeline), amend the constitution at Section VIII (tooling list) and Section X (compliance review), and add a `.changeset/README.md` contributor doc with worked examples of breaking and non-breaking changesets. The existing `ci.yml` (verify + Chromatic publish + MCP smoke test) stays unchanged; the release workflow runs alongside it on different triggers.

## Technical Context

**Language/Version**: TypeScript 5.x (existing); no language additions
**Primary Dependencies**:
- `@changesets/cli` (new) — workspace-root devDependency, pinned to the latest stable major
- `changesets/action` (GitHub Action, new in workflow files) — canonical release integration
- Existing: pnpm workspaces, Turborepo, GitHub Actions runner environment

**Storage**: filesystem only. `.changeset/*.md` files under `.changeset/`; `package.json` `version` field per package; `CHANGELOG.md` per package. No database, no external state.

**Testing**:
- Manual smoke test by opening a test PR and verifying the changeset-presence check fires correctly
- End-to-end validation by running `pnpm changeset` and `pnpm changeset version` locally to confirm output shape
- The integration test is SC-005 (spec 006's release ships entirely through this workflow with zero hand-authored content) — that's a real future verification

**Target Platform**: GitHub Actions Ubuntu runners (existing); local developer machines (any OS with Node + pnpm). Both already work for the current CI.

**Project Type**: Monorepo infrastructure spec. No new packages; root-level tooling and CI additions.

**Performance Goals**:
- Changeset-presence CI check completes in under 30 seconds (it's a tiny file-existence check)
- Release workflow opens or updates the "Version Packages" PR within 2 minutes of a push to `main`
- Publish step completes within 5 minutes of the "Version Packages" PR being merged

**Constraints**:
- ESM only (constitution Section VIII) — `@changesets/cli` is itself ESM-compatible
- Must not break the existing `ci.yml` (verify + publish to Chromatic + MCP smoke test all stay green)
- Constitution amendments are part of scope, not deferred (FR-008)
- NPM_TOKEN must be provisioned before the release workflow can publish; provisioning is a one-time prerequisite, not a recurring task

**Scale/Scope**:
- 1 new workspace-root devDependency (`@changesets/cli`)
- 1 new directory (`.changeset/`) with `config.json`, `README.md`, and per-PR `*.md` files
- 2 new GitHub Actions workflow files (`changeset-check.yml`, `release.yml`)
- Constitution amendment touching Section VIII (one-line tool addition) and Section X (one-sentence compliance review extension)
- 1 contributor doc with two worked-example changesets (breaking + non-breaking)
- 0 NEEDS CLARIFICATION items (resolved during `/speckit.clarify`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Section | Status | Notes |
|---|---|---|
| I. Repository shape | PASS | No new packages. The new directory `.changeset/` at repo root is workflow infrastructure, not a workspace member |
| II. Tokens independent of components | PASS | No token changes |
| III. Theming contract | PASS | Unrelated |
| IV. Components: shadcn/ui Base UI | PASS | No component changes |
| V. Stories are source of truth | PASS | Unrelated |
| VI. Testing | PASS | Component testing rules unaffected. The new CI workflows are tested manually + via the SC-005 integration moment with spec 006 |
| VII. Deployment + MCP | PASS | The existing `ci.yml` verify and publish jobs stay intact. The new release workflow runs on different triggers and does not interfere with Chromatic publishing or MCP smoke tests |
| VIII. Tooling baseline | AMENDMENT IN SCOPE | This spec adds `@changesets/cli` to the tool list. The amendment text is part of FR-008. PATCH-level constitution bump (clarification to existing tooling list, not a new principle) |
| IX. Definition of done for any component | PASS | Not component work |
| X. Governance | AMENDMENT IN SCOPE | This spec extends Section X Compliance Review with a one-sentence rule about changeset presence. Same PATCH-level constitution bump as Section VIII (combined amendment) |

**Bridge rules from Section XI (not yet ratified)**: humanizer pass on contributor doc and CHANGELOG entries, no three-item lists in any new prose, predictable command shapes (just `pnpm changeset` and `pnpm changeset version` — both well-known to anyone who has used Changesets elsewhere).

The two AMENDMENT IN SCOPE entries are not violations — they are the explicit reason for the spec's FR-008. The amendment lands as part of this spec's implementation, not as a separate spec. No Complexity Tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/003-versioning-workflow/
├── plan.md                  # This file
├── research.md              # Phase 0 output
├── data-model.md            # Phase 1 output (changeset-file + config shapes)
├── quickstart.md            # Phase 1 output (maintainer experience)
├── contracts/
│   ├── ci-workflows.md      # GitHub Actions workflow contracts
│   └── changeset-format.md  # .changeset/*.md and .changeset/config.json contracts
├── checklists/
│   └── requirements.md      # Spec quality checklist (from /speckit.specify)
├── spec.md                  # Source-of-truth feature spec
└── tasks.md                 # Created by /speckit.tasks
```

### Source Code / Infrastructure (repository root)

```text
.changeset/
├── config.json                              # New: workspace-level changeset config
└── README.md                                # New: contributor doc with worked examples

.github/workflows/
├── ci.yml                                   # Existing — unchanged
├── changeset-check.yml                      # New: PR-time changeset presence validation
└── release.yml                              # New: push-to-main release pipeline (uses changesets/action)

.specify/memory/constitution.md              # Amend: Section VIII tool list + Section X compliance review

package.json                                 # Modify: add @changesets/cli to devDependencies
pnpm-lock.yaml                               # Auto-regenerated on install

packages/tokens/CHANGELOG.md                 # Existing 0.2.0 entries stay; add header note about pre-workflow exception
packages/react/CHANGELOG.md                  # Existing 0.2.0 entries stay; add header note about pre-workflow exception
```

**Structure Decision**: Workflow infrastructure lives at the workspace root (`.changeset/`, `.github/workflows/`, `package.json`). No package-level changes — neither `@unbranded-ds/tokens` nor `@unbranded-ds/react` source code is touched. The constitution amendment is in scope and applied to `.specify/memory/constitution.md`. The existing `ci.yml` is left intact; new CI workflows are separate files with their own triggers, avoiding any merge complexity with the existing verify + Chromatic-publish + MCP-smoke-test pipeline.

## Phase 0: Outline & Research

See [research.md](./research.md) for the full Phase 0 output. Resolved items:

- **R1**: `.changeset/config.json` shape for pnpm + Turborepo two-package monorepo
- **R2**: `changesets/action` GitHub Action — version, configuration, behavior on PR vs push events
- **R3**: PR-time changeset-presence check approach (custom script vs separate action vs `changesets/action`'s built-in)
- **R4**: NPM_TOKEN scope and permissions (automation token, granular per-package or org-wide)
- **R5**: Coexistence with the existing `ci.yml` — separate workflow files vs extending the existing one
- **R6**: Contributor doc location (`.changeset/README.md` with link from repo root README)
- **R7**: Migration of spec 002's hand-authored entries (keep intact per FR-009; add a header note)
- **R8**: Constitution amendment exact text for Section VIII and Section X

No NEEDS CLARIFICATION items remain.

## Phase 1: Design & Contracts

**Prerequisites**: [research.md](./research.md) complete.

### Data Model

See [data-model.md](./data-model.md). Captures the five entities from the spec plus the precise shape of the `.changeset/config.json` file and the per-PR `.changeset/*.md` files.

### Contracts

See [contracts/](./contracts/):

- [contracts/ci-workflows.md](./contracts/ci-workflows.md) — the YAML contracts for the two new GitHub Actions workflows (changeset-check.yml + release.yml)
- [contracts/changeset-format.md](./contracts/changeset-format.md) — the file contracts for `.changeset/config.json` and the per-PR `.changeset/*.md` files

### Quickstart

See [quickstart.md](./quickstart.md). A maintainer's experience from "fresh clone" through "first release shipped via the workflow." Validates that the spec's user stories produce the documented outcomes.

### Agent context update

Run `.specify/scripts/bash/update-agent-context.sh claude` after this plan lands. New tech surface to record:

- `@changesets/cli` as the canonical versioning + changelog tool for the monorepo
- `.changeset/` directory and the per-PR file convention
- `pnpm changeset` and `pnpm changeset version` commands
- The `changesets/action` GitHub Action in `.github/workflows/release.yml`
- NPM_TOKEN secret in GitHub repo settings (one-time provisioning)

## Post-Phase-1 Constitution Re-Check

All gates still PASS after Phase 1 design. The two AMENDMENT IN SCOPE entries (Section VIII tool list, Section X compliance review) remain the same scope as identified pre-research; the design did not surface any new principles requiring amendment.

## Complexity Tracking

No constitution violations. This section intentionally left empty.
