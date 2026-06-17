# Feature Specification: Versioning and release workflow

**Feature Branch**: `003-versioning-workflow`
**Created**: 2026-05-16
**Status**: Draft
**Input**: User description: "Adopt @changesets/cli as the canonical versioning and changelog workflow for the unbranded-ds monorepo"

## Clarifications

### Session 2026-05-16

- Q: When does the CI changeset-check enforcement flip from warning to blocking? → A: Block from day one (option D) — the repo currently has a single contributor, so a grace period serves no purpose. The CI check is a hard error for any PR touching `packages/` without a changeset, starting with this spec.
- Q: How should CI authenticate to npm for the publish step? → A: NPM_TOKEN secret in GitHub repo settings (option A). Provision an automation token on npm, store as `NPM_TOKEN`, CI consumes it for publish. OIDC trusted publishing is the more secure long-term path and can land as a follow-up spec once we have lived with the token-based flow.
  - **Amended during implementation (2026-05-16)**: switched to OIDC trusted publishing (option B from the original question) before any NPM_TOKEN was provisioned. npm's UI actively warned against the 2FA-bypass that automation tokens require, and pointed at trusted publishing as the recommended alternative. The release.yml workflow already had the `id-token: write` permission needed for OIDC (added during planning under the "reserved for future OIDC migration" rationale), so OIDC ended up being less total work than provisioning a long-lived token and managing its rotation. Trusted publishers configured on `@unbranded-ds/tokens` and `@unbranded-ds/react` name this repo's `release.yml` workflow as the authorized publisher. NPM_CONFIG_PROVENANCE is enabled so published versions carry npm's verified-provenance attestation. FR-007, the Dependencies section, and `.github/workflows/release.yml` reflect this change.
- Q: What's the quality bar for changeset descriptions, especially on breaking changes? → A: Self-contained CHANGELOG (option B). Breaking changes get a multi-paragraph migration guide directly in the changeset markdown body (before/after examples, named cause-and-effect, soft-data-loss notes). Non-breaking changes can be one-liners. Matches the 0.2.0 precedent and the agent-and-human-legibility principle.
- Q: Where in the constitution does the new per-PR changeset rule live? → A: Append to Section X (Governance) Compliance Review (option B). Section X already has the exact scope the changeset rule needs ("every PR that touches packages/..."); appending one sentence extends the existing compliance pattern. Section VIII still gets the `@changesets/cli` tool-list entry separately.
- Q: Should we support snapshot or prerelease releases? → A: Defer (option A). Spec 003 ships `latest`-only releases. Snapshot or pre-mode support lands in a future spec when there's concrete demand (for-coleman asking for early-access builds, a community consumer testing a breaking change, etc.). Low value for a single-contributor DS at this stage.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Maintainer captures intent per PR rather than hand-authoring releases (Priority: P1)

A design-system maintainer opens a pull request that modifies code in `packages/tokens` or `packages/react`. Before merge, they run a single command that asks what changed and at what bump level, captures their answer in a small markdown file, and commits it alongside the change. Version bumps and CHANGELOG entries are produced from these per-PR files at release time. No one hand-authors CHANGELOGs anymore.

**Why this priority**: Hand-authored CHANGELOGs worked for the single 0.2.0 release. They do not scale. Spec 006 ships another breaking change. Spec 004 adds four new components. Without tooling, every release is a multi-package coordination chore where someone has to remember which packages bumped, why, at what level, and write the right entries in two CHANGELOGs by hand. The maintainer-side workflow is the entire reason this spec exists.

**Independent Test**: Open a PR that modifies `packages/tokens/src/runtime.ts`. Run `pnpm changeset`. Pick the affected package, the bump level, and write a one-sentence description. Confirm a `.changeset/*.md` file is created and tracks the change. Merge the PR. Verify the markdown file is part of the merged commit history.

**Acceptance Scenarios**:

1. **Given** the workflow is installed, **When** a maintainer runs `pnpm changeset` in a repo with changes to `packages/tokens`, **Then** the tool prompts for affected packages and bump levels, writes a uniquely-named markdown file under `.changeset/`, and the file's content captures the change description verbatim from the maintainer's input.
2. **Given** multiple unmerged PRs each add their own changeset file, **When** a release shepherd runs `pnpm changeset version`, **Then** both packages bump correctly per the highest-severity changeset for each package, CHANGELOGs receive new entries combining all the descriptions, and the internal `workspace:*` dependency reference is patch-bumped to match.
3. **Given** a PR introduces a breaking change in `@unbranded-ds/tokens`, **When** the maintainer marks the changeset as `major` for tokens (or `minor` pre-1.0), **Then** the eventual version bump matches their declared intent and the CHANGELOG entry is filed under the appropriate heading.

---

### User Story 2 — CI catches PRs that touch packages without a changeset (Priority: P1)

A contributor opens a PR that modifies a file under `packages/`. CI runs a check that confirms the PR includes at least one `.changeset/*.md` file. If a changeset is missing, CI surfaces a clear warning (or, after the grace period, blocks merge) so the change does not silently slip into a release without notes.

**Why this priority**: Tooling that depends on contributor discipline always loses to forgetfulness. The CI guard is what makes the workflow reliable — without it, someone eventually merges a PR without a changeset, and the next release is wrong. Pairs with Story 1 to make the workflow practically enforceable.

**Independent Test**: Open a PR that modifies `packages/react/src/components/Button/Button.tsx` without adding a `.changeset/*.md` file. Confirm CI reports a warning (or error, depending on enforcement stage) naming the missing changeset. Add a changeset, push, confirm CI passes.

**Acceptance Scenarios**:

1. **Given** a PR modifies a file under `packages/`, **When** the changeset-presence check runs, **Then** the absence of any `.changeset/*.md` file in the PR triggers a clearly-named failure (or warning, per current enforcement) that names the missing artifact.
2. **Given** a PR modifies only documentation, configuration, or other non-published files, **When** the same check runs, **Then** the PR is allowed to merge without a changeset because the change does not ship to consumers.
3. **Given** a contributor explicitly intends a no-op release-side change (e.g., comment edit inside a published file), **When** they add an empty changeset to bypass the check, **Then** the check passes and the empty changeset produces no CHANGELOG entry.

---

### User Story 3 — Release shepherd reviews a "Version Packages" PR (Priority: P2)

After several PRs with changesets have merged to `main`, an automated workflow opens a single "Version Packages" PR that bumps both packages, applies their respective CHANGELOG entries, and consumes the pending changeset files. The release shepherd reviews this PR like any other change. Merging it triggers the actual publish step.

**Why this priority**: The pattern keeps the release moment reviewable and rollback-able. Without it, releases happen at the moment a maintainer pushes a tag, with no review window. With it, the human decision moves from "did I bump correctly?" (Story 1) to "should we ship now?" (Story 3).

**Independent Test**: Land two PRs with changesets affecting different packages on `main`. Confirm the workflow opens a single "Version Packages" PR that contains the version bumps and CHANGELOG diffs. Merge it. Confirm a publish step runs and the new versions reach the package registry.

**Acceptance Scenarios**:

1. **Given** at least one unconsumed changeset exists on `main`, **When** the release workflow runs, **Then** it opens or updates a "Version Packages" PR whose diff includes the version bumps in `package.json`, the new CHANGELOG entries, and the removal of the consumed changeset files.
2. **Given** the "Version Packages" PR is merged to `main`, **When** the post-merge workflow runs, **Then** the new versions publish to the package registry under the same `publishConfig.access: public` setting that the packages already declare.
3. **Given** there are no unconsumed changesets on `main`, **When** the release workflow runs, **Then** no "Version Packages" PR is opened (or any existing one is closed) and no publish happens.

---

### User Story 4 — Retroactive migration of the 0.2.0 hand-authored entries (Priority: P3)

The 0.2.0 release shipped CHANGELOG entries that were hand-authored as a one-time exception before this spec existed. After this spec lands, the workflow can either treat those entries as historical (leave them as-is) or replicate them as retroactive changeset files (so the history is uniform). The spec resolves the disposition explicitly.

**Why this priority**: Lower than the live workflow because the 0.2.0 entries are already published and consumers have read them. The retroactive cleanup is a quality-of-history concern, not a release-mechanics concern. Worth doing for consistency, but does not block the workflow's first real use.

**Independent Test**: After this spec lands, verify the 0.2.0 CHANGELOG entries either remain unchanged (with a note in the new contributor docs explaining they predate the workflow) or have corresponding archived changeset files. Either choice is acceptable; the test is that the resolution is documented.

**Acceptance Scenarios**:

1. **Given** the 0.2.0 release has already shipped with hand-authored CHANGELOG entries, **When** the new workflow lands, **Then** a contributor doc (in the repo or in the constitution) names the one-time exception so future readers understand why those entries do not have matching `.changeset/*.md` history.
2. **Given** a future contributor wonders where the 0.2.0 changeset files are, **When** they look in `.changeset/` or read the CHANGELOG, **Then** they find a clear explanation pointing at this spec as the reason.

---

### Edge Cases

- **PR that modifies only `apps/storybook` or other non-published workspace members.** No changeset required. The workflow's `ignore` setting excludes these from version-bump consideration.
- **PR that introduces a breaking change pre-1.0.** Pre-1.0 semver allows breaking changes in `minor` bumps. The workflow accepts `minor` as the bump level for breaking pre-1.0 changes; the CHANGELOG entry is responsible for naming the breaking nature in prose.
- **Contributor accidentally writes a changeset for the wrong package.** Reviewable in the PR. The release shepherd can request a fix before merge, or correct it in a follow-up changeset.
- **Two PRs land concurrent changesets that affect the same package at different levels.** The "Version Packages" PR resolves by taking the highest-severity bump (one `major` + one `patch` resolves to `major`).
- **The `workspace:*` internal dependency reference between packages.** When one package bumps, the other's lockfile reference to it must stay accurate. The configured `updateInternalDependencies: "patch"` setting handles this automatically; a separate manual lockfile edit is never required.
- **Constitution amendment lands together or separately?** This spec includes the Section VIII tooling-baseline update and the new workflow rule. If spec 005 (Section XI amendment) lands first, the constitution version is already 1.1.0 and this spec bumps to 1.2.0. If this spec lands first, it bumps to 1.1.0 and spec 005 later goes to 1.2.0. Either ordering produces a coherent SYNC IMPACT REPORT chain.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `@changesets/cli` MUST be installed at the workspace root as a `devDependency`. The version MUST be pinned (caret-pinned) to a stable major release.
- **FR-002**: A `.changeset/config.json` MUST exist at the repo root, configured for the two-package monorepo. The configuration MUST include `"access": "public"` (matching the existing `publishConfig` on both packages), `"baseBranch": "main"`, `"updateInternalDependencies": "patch"`, and an `"ignore"` list that excludes `apps/storybook` (and any other unpublished workspace members) from version-bump consideration.
- **FR-003**: Contributors MUST be able to create a new changeset by running `pnpm changeset` from the repo root. The tool MUST present an interactive prompt that asks which packages changed, what bump level applies to each, and a free-form change description. The resulting file MUST be a valid markdown file under `.changeset/` with a unique name.
- **FR-004**: A release shepherd MUST be able to consume all pending changesets via `pnpm changeset version`. The command MUST update each affected package's `version` field in `package.json`, write or append a CHANGELOG.md entry per package, and remove the consumed `.changeset/*.md` files in the same operation.
- **FR-005**: A CI workflow MUST run on every pull request that touches files under `packages/` and MUST verify the PR includes at least one `.changeset/*.md` file. The check MUST fail (block merge) when no changeset is present. The repo has a single contributor at the time this workflow ships, so no warning-mode grace period is needed; the check is a hard error from day one.
- **FR-006**: A release workflow MUST run on push to `main`. When unconsumed changesets exist, it MUST open or update a single "Version Packages" pull request whose diff includes the version bumps, the new CHANGELOG entries, and the removal of the consumed changeset files. When no unconsumed changesets exist, no PR MUST be opened.
- **FR-007**: When a "Version Packages" PR is merged to `main`, the release workflow MUST publish the affected packages to the package registry at their new versions. The publish step MUST honor the existing `publishConfig.access: "public"` settings on each package. CI authentication to npm MUST use OIDC trusted publishing: each package's npm settings names this repo's `release.yml` workflow as the authorized trusted publisher, and the workflow MUST request the GitHub OIDC token via the `id-token: write` permission so npm can mint a short-lived publish token per release. No long-lived `NPM_TOKEN` secret is provisioned. Published versions MUST carry npm's verified-provenance attestation via `NPM_CONFIG_PROVENANCE: "true"`.
- **FR-008**: The constitution MUST be amended to: (a) add `@changesets/cli` to the tooling baseline list in Section VIII, and (b) extend the Section X Compliance Review subsection to require that every PR touching `packages/` include at least one `.changeset/*.md` file (alongside the existing Constitution Check requirement). The amendment MUST follow the existing SYNC IMPACT REPORT pattern from Section X and bump the constitution version per its versioning policy (PATCH-level for clarification, since the rule extends existing machinery rather than introducing a new principle).
- **FR-009**: The 0.2.0 hand-authored CHANGELOG entries (in `packages/tokens/CHANGELOG.md` and `packages/react/CHANGELOG.md`) MUST remain intact. A note MUST be added (in a contributor-facing location) explaining that those entries predate this workflow and are the one-time exception.
- **FR-010**: A short contributor-facing doc (in `CONTRIBUTING.md`, a `.changeset/README.md`, or the relevant section of the repo `README.md`) MUST cover the practical contributor workflow: when to run `pnpm changeset`, how to pick a bump level, what to write in the description (with the quality bar from FR-013 explicit), and what happens after the PR merges. The doc MUST include at least one worked example of a breaking-change changeset and one of a non-breaking changeset, with the differing detail levels visible. This doc MUST be discoverable from the repo root.
- **FR-013**: Changeset descriptions MUST meet a content quality bar that varies by bump level. Breaking-change changesets (`major` pre-1.0 `minor`) MUST include a multi-paragraph migration guide in the markdown body covering at minimum: the nature of the breaking change, the consumer-side action required (with before/after code or import-path examples where applicable), and any soft-data-loss, compatibility, or rollback implications. Non-breaking changesets (`minor` for additions, `patch` for fixes) MAY be one-liners. The 0.2.0 hand-authored CHANGELOG entries in `packages/tokens/CHANGELOG.md` and `packages/react/CHANGELOG.md` are the reference precedent.
- **FR-011**: The `packages/storybook` workspace member (and any other unpublished workspace member) MUST be excluded from the changeset workflow via the `ignore` config. PRs that only modify ignored workspace members MUST NOT require a changeset and MUST pass the CI check from FR-005.
- **FR-012**: The internal `workspace:*` dependency from `@unbranded-ds/react` to `@unbranded-ds/tokens` MUST continue to resolve correctly through every release cycle. The `updateInternalDependencies: "patch"` setting MUST ensure that when `@unbranded-ds/tokens` bumps for any reason, `@unbranded-ds/react` receives at least a patch bump so consumers installing both at the new versions get a consistent pair.

### Key Entities

- **Changeset file**: A markdown file under `.changeset/` with frontmatter declaring which packages bump and at what level, followed by a free-form description body. One file per PR (typically). Consumed at release time and converted into CHANGELOG entries.
- **`.changeset/config.json`**: The workspace-level configuration declaring the canonical settings for the workflow (`access`, `baseBranch`, `updateInternalDependencies`, `ignore` list).
- **`CHANGELOG.md` per package**: Generated by `pnpm changeset version` from the accumulated changeset files. Owned by the tool; contributors do not hand-edit these after this spec lands.
- **"Version Packages" pull request**: A canonical PR opened by the release workflow that batches version bumps and CHANGELOG updates for review before publish. Pattern is standard to Changesets and well-known to anyone who has used the tool elsewhere.
- **Contributor doc**: A short walkthrough of the workflow from a contributor's perspective, discoverable from the repo root. Pairs the CI check with a place to learn the right answer when CI complains.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Every PR merged to `main` that modifies a file under `packages/` includes at least one `.changeset/*.md` file. The CI check (FR-005) blocks merge when this is violated, so the measured rate is 100% by construction.
- **SC-002**: The version-bump and CHANGELOG-update steps for any future release require zero hand-editing of `package.json` `version` fields or `CHANGELOG.md` files. The release shepherd runs `pnpm changeset version` and reviews the resulting "Version Packages" PR; they do not write CHANGELOG prose or pick version numbers themselves.
- **SC-003**: A new contributor can land a published-package change in under 15 minutes from cloning the repo, including reading the contributor doc and producing a valid changeset. Measured by walkthrough on the example app or by external feedback after the first community contribution.
- **SC-004**: When `@unbranded-ds/tokens` bumps, `@unbranded-ds/react` receives at least a patch bump in the same release cycle (per FR-012). Verified by inspecting the "Version Packages" PR diff for every cross-package release.
- **SC-005**: Spec 006 (token schema growth, the next breaking-change spec) ships its release entirely through this workflow, with zero hand-authored CHANGELOG content. This is the integration test for the workflow.
- **SC-006**: An agent or human reading the package's CHANGELOG.md for a given version can extract the full set of changes AND the migration steps for any breaking change without reading any other source (commits, PRs, release notes, or a separate migration doc). Breaking-change entries are self-sufficient migration guides per FR-013; non-breaking entries are one-line summaries. The CHANGELOG is the canonical source for "what changed and how do I migrate."

## Assumptions

- The two-package monorepo shape is stable; new packages are not added during this spec. Adding a future framework package (e.g., `@unbranded-ds/vue`) is out of scope but the configuration shape can extend to it.
- Pre-1.0 semver continues to apply: breaking changes are allowed in `minor` bumps. The Changesets tool does not enforce stricter semver; the contributor decides the bump level appropriately.
- The package registry is npm (per the existing `publishConfig`). Different registries would need different publish-workflow configuration but the changeset side of the workflow is registry-agnostic.
- The CI host is GitHub Actions (per the existing CI workflows in the repo). The release-side workflow uses the official `changesets/action` GitHub Action, which is the canonical Changesets release integration.
- The contributor doc lives at `.changeset/README.md` initially. If a `CONTRIBUTING.md` exists or is added later, the same content may move there with a forwarding pointer.
- Constitution amendment lands as part of this spec, not as a separate spec. The amendment is small enough (adding a tool to Section VIII plus a one-sentence rule) that splitting it out adds ceremony without benefit.
- Snapshot and prerelease publishing modes (Changesets `snapshot` for one-off `next`-tag builds, `pre` mode for coordinated `0.x.y-rc.N` sequences) are out of scope. The release workflow publishes only to the npm `latest` tag. A future spec adds prerelease capability if a concrete consumer demand emerges (a community consumer testing a breaking change, a coordinated multi-spec rollout, etc.).

## Dependencies

- Spec 002 must have shipped (it has, per the 0.2.0 release on `main`). The 0.2.0 CHANGELOG entries serve as the historical baseline.
- The GitHub Actions runner environment must continue to support pnpm-installed workspace projects and Node.js LTS. No new runner requirements are introduced by this spec.
- The npm registry must accept OIDC trusted publishes from this repo's `release.yml` workflow. Configuring trusted publishing (in each package's npm Settings → Trusted Publisher section, naming GitHub Actions as the OIDC issuer, `kendrick/unbranded-ds` as the repo, and `release.yml` as the workflow file) is a prerequisite for FR-007. The setup is per-package and one-time; it does not introduce any long-lived secrets into the GitHub repo.
