# Contract: CI workflow files

Two new GitHub Actions workflow files land under `.github/workflows/` as part of this spec. Their contracts are below. The existing `ci.yml` (verify + Chromatic publish + MCP smoke test) stays unchanged.

## `.github/workflows/changeset-check.yml`

**Trigger**: pull requests that target `main`.

**Purpose**: enforce that every PR touching `packages/tokens/` or `packages/react/` includes at least one `.changeset/*.md` file. Per FR-005 (and Q1 clarification), this is a hard block from day one — no warning mode.

**Contract**:

```yaml
name: Changeset check

on:
  pull_request:
    branches: [main]

jobs:
  changeset-check:
    name: Verify changeset present for package changes
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Detect package changes
        id: detect
        run: |
          if git diff --name-only origin/main...HEAD | grep -qE '^packages/(tokens|react)/'; then
            echo "package_changed=true" >> "$GITHUB_OUTPUT"
          else
            echo "package_changed=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Verify changeset present
        if: steps.detect.outputs.package_changed == 'true'
        run: |
          pnpm changeset status --since=origin/main --output=/tmp/status.json
          NEW=$(jq '.changesets | length' /tmp/status.json)
          if [ "$NEW" -eq 0 ]; then
            echo "::error::PR touches packages/ but no .changeset/*.md file is present. Run 'pnpm changeset' from the repo root, pick the affected packages and bump levels, and commit the resulting file. See .changeset/README.md for the contributor workflow."
            exit 1
          fi
          echo "✓ Found $NEW changeset(s) for this PR"
```

**Required behavior**:
- A PR that modifies only docs, configuration, or files outside `packages/tokens/` and `packages/react/` MUST pass without requiring a changeset (the `detect` step short-circuits).
- A PR that modifies any file under `packages/tokens/` or `packages/react/` and lacks a `.changeset/*.md` file MUST fail with the named error message that points the contributor at `.changeset/README.md`.
- The check MUST complete in under 30 seconds for any PR.

## `.github/workflows/release.yml`

**Trigger**: push to `main`.

**Purpose**: opens or updates the "Version Packages" PR when unconsumed changesets exist on `main`; publishes packages to npm when the "Version Packages" PR is merged. Both behaviors are handled by the official `changesets/action`.

**Contract**:

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Version or publish
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: https://registry.npmjs.org

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build packages
        run: pnpm --filter '@unbranded-ds/*' build

      - name: Create or publish release
        uses: changesets/action@v1
        with:
          version: pnpm changeset version
          publish: pnpm changeset publish
          commit: "chore(release): version packages"
          title: "chore(release): version packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Required behavior**:
- When unconsumed changesets are on `main`, the action MUST open or update a single "Version Packages" PR. The PR's commit and title both use the prefix `chore(release):` to keep the conventional-commits style consistent with the rest of the repo.
- When the "Version Packages" PR is merged (i.e., the version-bump commits are on `main`), the action MUST run `pnpm changeset publish` and publish the affected packages to npm using the `NPM_TOKEN` secret.
- The build step MUST run before publish — `pnpm changeset publish` will publish whatever is in each package's `files` array, which assumes `dist/` is present.
- The `concurrency` group MUST prevent two release runs from racing on `main`.
- The `permissions` block MUST include `contents: write` (to commit the Version Packages PR) and `pull-requests: write` (to open/update PRs). `id-token: write` is reserved for the future OIDC migration noted in FR-007.

## Coexistence with the existing `ci.yml`

The existing `ci.yml` runs on pull requests and pushes to `main`. The two new workflows run on the same triggers but do different things:

- `ci.yml` verifies correctness (lint/typecheck/test/build) and publishes Storybook to Chromatic
- `changeset-check.yml` (PR only) verifies changeset presence on package-touching PRs
- `release.yml` (push to main only) opens Version Packages PRs and publishes packages to npm

A PR with package changes will see two checks: `ci.yml`'s `verify` and `changeset-check.yml`'s `changeset-check`. Both must pass for merge.

A push to `main` will see `ci.yml`'s verify + publish jobs AND `release.yml`'s release job. They run independently; failure of one does not affect the other.
