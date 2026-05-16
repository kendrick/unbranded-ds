# Phase 0 Research: Versioning and release workflow

## R1 — `.changeset/config.json` shape for pnpm + Turborepo two-package monorepo

**Decision**: A single `.changeset/config.json` at the repo root with the following shape:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@unbranded-ds/storybook"]
}
```

**Rationale**:
- `access: "public"` matches the existing `publishConfig.access` on both packages
- `baseBranch: "main"` matches the repo's default branch
- `updateInternalDependencies: "patch"` is what FR-002 requires — when `@unbranded-ds/tokens` bumps, `@unbranded-ds/react` (which depends on tokens via `workspace:*`) gets at least a patch bump
- `ignore: ["@unbranded-ds/storybook"]` excludes the storybook app workspace member from version-bump consideration (FR-011)
- `commit: false` means Changesets does not auto-commit version-bump diffs; the `changesets/action` GitHub Action handles commits via the "Version Packages" PR mechanism
- `fixed: []` and `linked: []` are intentionally empty — packages bump independently per their changesets, not in lockstep
- `changelog: "@changesets/cli/changelog"` uses the default Changesets changelog formatter; per-spec-clarification Q3, breaking-change descriptions in the markdown body carry the migration content, so a custom formatter isn't needed

**Alternatives considered**:
- `fixed` mode where both packages always bump together: rejected. Pre-1.0, the two packages have legitimately independent change cadences. Forcing lockstep would inflate version numbers on the package that didn't actually change.
- `@changesets/changelog-github` formatter (auto-links to PRs and contributors): considered. Adds a small dependency and requires GITHUB_TOKEN at version-bump time. Defer — the default formatter is enough for now; switch to the GitHub formatter if PR-linked CHANGELOGs become valuable (likely once there are external contributors).

## R2 — `changesets/action` GitHub Action behavior

**Decision**: Use `changesets/action@v1` (the official, currently-maintained action) with a release workflow that runs on push to `main`. The action behaves differently based on whether pending changesets exist:

- **When unconsumed changesets are on `main`**: opens (or updates) a "Version Packages" PR whose diff includes the version bumps, the new CHANGELOG entries, and the deletion of the consumed `.changeset/*.md` files
- **When the "Version Packages" PR has been merged to `main`**: detects that the bumps are now on `main`, runs the `publish` step, and publishes the packages to npm

The action provides this via two configuration knobs in the workflow:

```yaml
- uses: changesets/action@v1
  with:
    version: pnpm changeset version
    publish: pnpm changeset publish
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

The `version` command opens the Version Packages PR; the `publish` command runs after the PR merges.

**Rationale**: Canonical pattern documented by the Changesets team. Battle-tested across hundreds of monorepos (Radix, Astro, Shadcn, etc.). Handles all the orchestration that would otherwise need custom scripting.

**Alternatives considered**:
- Hand-rolled release workflow using `pnpm changeset version` + `git commit` + `gh pr create`: more control, more code to maintain. Not worth the complexity.
- Running `pnpm changeset version` locally and pushing the result manually: bypasses the review pause in the "Version Packages" PR pattern. Loses the human-review checkpoint that the spec relies on for Story 3.

## R3 — PR-time changeset-presence check

**Decision**: Use a small custom GitHub Actions workflow that runs `pnpm changeset status --since=origin/main` and fails if no new changesets are present when files under `packages/` have changed. Two scripts in the workflow file:

```yaml
- name: Detect package changes
  id: detect
  run: |
    if git diff --name-only origin/main...HEAD | grep -qE '^packages/(tokens|react)/'; then
      echo "package_changed=true" >> "$GITHUB_OUTPUT"
    fi

- name: Verify changeset present
  if: steps.detect.outputs.package_changed == 'true'
  run: |
    pnpm changeset status --since=origin/main --output=/tmp/status.json
    NEW=$(jq '.changesets | length' /tmp/status.json)
    if [ "$NEW" -eq 0 ]; then
      echo "::error::PR touches packages/ but no changeset is present. Run 'pnpm changeset' to add one."
      exit 1
    fi
```

**Rationale**:
- `changesets/action` itself does not have a built-in "block PR if no changeset" mode — its PR-time behavior is to post a comment with status info, not to fail the check
- Several third-party actions exist (e.g., `dotansimha/changesets-changelog-enforcer`) but they add an external dependency for what's a 15-line script
- The custom script gives precise control over the failure message (per FR-005's "clearly-named failure that names the missing artifact" requirement)
- The script reuses `pnpm changeset status` so we don't reimplement the file-detection logic Changesets already has

**Alternatives considered**:
- `changesets/action` with `setupGitUser: false` and a custom step to fail on missing: tangled, mixes status-comment concern with PR-block concern
- A separate npm package that does this check: more deps, no real benefit

## R4 — NPM_TOKEN scope and permissions

**Decision**: Provision an **automation token** (npm classic token type) with **publish access** scoped to the `@unbranded-ds` organization. Store it as `NPM_TOKEN` in GitHub repo secrets.

Specific provisioning steps for the implementation phase:

1. Log into npmjs.com with the account that owns the `@unbranded-ds` org
2. Account settings → Access Tokens → Generate New Token → Classic Token → "Automation" type → Read and write
3. (Optional but recommended): scope the token to only the `@unbranded-ds` org via the "Packages and scopes" picker
4. Copy the token value (shown once)
5. In the GitHub repo: Settings → Secrets and variables → Actions → New repository secret → Name: `NPM_TOKEN`, Value: the token from step 4
6. Verify by triggering the release workflow against a test changeset (after the rest of this spec lands)

**Rationale**:
- Automation tokens are the type npm recommends for CI publishing (vs Publish tokens which can require 2FA at publish time)
- Scoping to the org limits blast radius if the token leaks
- "Classic" tokens (not granular access tokens) are required by `npm publish` in CI — granular tokens have limitations with `pnpm publish` in some configurations

**Alternatives considered**:
- npm trusted publishing via GitHub OIDC: more secure (no long-lived secret), but requires per-package configuration on the npm side and adds setup ceremony. Already documented as a future improvement in FR-007.
- Granular access tokens: better security model in theory, but interoperability with `pnpm changeset publish` is inconsistent. Not worth fighting.

## R5 — Coexistence with the existing `ci.yml`

**Decision**: Add the new changeset-check and release workflows as separate files (`changeset-check.yml` and `release.yml`) rather than extending the existing `ci.yml`.

**Rationale**:
- Different triggers: `ci.yml` runs on push to main + PRs; `changeset-check.yml` only on PRs; `release.yml` only on push to main
- Different concerns: `ci.yml` is about correctness (lint/typecheck/test/build); the new workflows are about release management
- Separating files keeps each one short and reviewable
- Failure of one workflow does not gate the other (e.g., a missing changeset shouldn't block the verify job from running)

**Alternatives considered**:
- Add new jobs to `ci.yml`: tangles concerns and makes the file harder to scan
- Replace `ci.yml` entirely with a multi-workflow setup: too disruptive; spec explicitly says `ci.yml` stays intact

## R6 — Contributor doc location

**Decision**: Live at `.changeset/README.md` with a one-line pointer added to the repo root `README.md` so contributors landing on the repo can find it.

The repo root README gets one new bullet in its Getting-started section:

```markdown
- See [.changeset/README.md](.changeset/README.md) for the per-PR changeset workflow
```

**Rationale**:
- `.changeset/README.md` is the Changesets convention — `pnpm changeset init` auto-creates a starter version, and we customize it for our needs
- Co-located with the workflow (a contributor who runs `pnpm changeset` is looking in `.changeset/` and finds the doc naturally)
- The README pointer ensures discoverability from the repo entry point
- Avoids spinning up a new top-level `CONTRIBUTING.md` for what's currently a single contributor topic — that file can land later when there are more contributor concerns to document

**Alternatives considered**:
- `CONTRIBUTING.md` at repo root: appropriate later when there's a broader contributor doc to write. Single-topic CONTRIBUTING.md feels premature.
- Section in repo `README.md` only: keeps everything in one file but bloats the README. The README is consumer-facing too, and contributor specifics there dilute the consumer message.

## R7 — Migration of spec 002's hand-authored entries

**Decision**: Keep the 0.2.0 CHANGELOG entries in `packages/tokens/CHANGELOG.md` and `packages/react/CHANGELOG.md` exactly as they are. Add a one-paragraph header note above the 0.2.0 entry on each file explaining that the entry predates the Changesets workflow and is the one-time exception.

The header note (one per CHANGELOG file, placed before the `## 0.2.0` heading):

```markdown
> The 0.2.0 entry below was hand-authored before the Changesets workflow landed in spec 003. From 0.3.0 onward, entries are auto-generated from per-PR `.changeset/*.md` files. See [.changeset/README.md](../../.changeset/README.md) for the current contributor workflow.
```

**Rationale**:
- Per FR-009, the 0.2.0 entries stay intact — they've been published and consumers have read them
- The header note satisfies Story 4's acceptance scenario that a future contributor looking at the CHANGELOG finds an explanation for the format gap
- Pointing at `.changeset/README.md` from the header note creates a forward path for any contributor who wants more context

**Alternatives considered**:
- Retroactively author `.changeset/*.md` files matching the 0.2.0 content, then have Changesets "consume" them to regenerate the CHANGELOG: would work but rewrites already-shipped content. The current 0.2.0 entries are good; rewriting them risks subtle prose differences that confuse anyone who already read the shipped version.
- No header note (rely on the contributor doc alone): less discoverable. Someone reading just the CHANGELOG without knowing about the workflow change would be confused.

## R8 — Constitution amendment exact text

**Decision**: The amendment touches Section VIII and Section X with the exact text below.

### Section VIII addition

In the bulleted tool list in Section VIII, after the `CI` line, add:

```markdown
- Versioning + changelog: **`@changesets/cli`** (workspace dev dependency). Per-PR `.changeset/*.md` files aggregate into per-package CHANGELOG.md entries and version bumps via `pnpm changeset version`. Publish via `changesets/action` GitHub Action.
```

### Section X Compliance Review extension

In Section X, replace the current paragraph:

```markdown
**Compliance review.** Every PR that touches `packages/react/`, `packages/tokens/`, or
`apps/storybook/` MUST include a Constitution Check confirming the change does not violate
any section of this document. The plan template's Constitution Check gate implements this
requirement. A PR that cannot pass the check MUST either (a) not be merged, or (b) trigger
a constitution amendment before merge.
```

With:

```markdown
**Compliance review.** Every PR that touches `packages/react/`, `packages/tokens/`, or
`apps/storybook/` MUST include a Constitution Check confirming the change does not violate
any section of this document. The plan template's Constitution Check gate implements this
requirement. Additionally, every PR that touches `packages/react/` or `packages/tokens/`
MUST include at least one `.changeset/*.md` file declaring which packages bump and at what
level (per spec 003's adoption of `@changesets/cli`); the CI check `changeset-check.yml`
enforces this. A PR that cannot pass either check MUST either (a) not be merged, or (b)
trigger a constitution amendment before merge.
```

### Version bump

PATCH-level (1.0.0 → 1.0.1, OR whatever the current version is + a patch). Rationale: the changes are clarifications to existing machinery (tooling list, compliance review) rather than new principles. Per Section X's versioning policy, PATCH covers "clarifications, wording fixes, typo corrections, or non-semantic refinements" — the changeset-rule extension is closest to a wording extension of an existing rule, not a new principle.

If spec 005's Section XI amendment has already landed (constitution would be at 1.1.0), this spec bumps to 1.1.1. If this spec lands first, it bumps from 1.0.0 to 1.0.1, and spec 005 later goes to 1.1.0 (since adding Section XI is MINOR-level — a new principle).

**Rationale**: The PATCH choice keeps the version bump small and proportional. The compliance review extension is one sentence appended to an existing rule about the same scope of PRs — adding rigor, not redirecting principle.

**Alternatives considered**:
- MINOR bump on the grounds that any new MUST is significant: defensible but inflated for a one-sentence extension of an existing compliance rule
- A separate constitution amendment PR landed before this spec's implementation: more ceremony, no benefit — the amendment IS part of this spec's deliverable
