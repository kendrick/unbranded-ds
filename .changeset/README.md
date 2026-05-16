# Changesets

This folder holds the per-PR version notes that drive releases of `@unbranded-ds/tokens` and `@unbranded-ds/react`. Each PR that ships a user-visible change writes a small markdown file here. When the PR merges to `main`, the [changesets GitHub action](https://github.com/changesets/action) collects those files and opens a "Version Packages" PR that bumps versions, updates each package's `CHANGELOG.md`, and removes the consumed files. Merging that release PR publishes the new versions to npm.

If you're new to Changesets, the [official docs](https://github.com/changesets/changesets) cover the underlying tool. This guide covers our project conventions on top of it.

## When to add a changeset

Run `pnpm changeset` from the repo root any time your PR modifies files under `packages/tokens/` or `packages/react/`. That includes:

- new components, exports, tokens, or theme files
- bug fixes to existing components or token outputs
- changes to public types, prop signatures, or CSS class contracts
- changes to package `exports` maps or other `package.json` consumer-facing fields

You don't need a changeset for changes confined to Storybook, root configs, internal docs, the changeset folder itself, or test-only edits that don't change shipped code.

The CLI walks you through which packages are affected and which bump level applies. It writes a markdown file with a random name (e.g. `quiet-snakes-jog.md`) into `.changeset/`. Edit that file to flesh out the description before pushing.

## Picking a bump level

We follow semver with the standard pre-1.0 carve-out:

- **`major`** — breaking changes once a package is at `1.0.0` or later. Removed exports, renamed props, changed CSS contracts that downstream apps depend on.
- **`minor`** — new features, new exports, or **breaking changes while the package is still pre-1.0** (`0.x.y`). Pre-1.0 semver treats the minor segment as the breaking-change signal, so a removed export at `0.2.0` lands as `0.3.0`, not `1.0.0`.
- **`patch`** — bug fixes, doc-only changes inside the package, and internal refactors that keep the public surface identical.

When in doubt, err toward the larger bump. A spurious minor bump costs nothing; a missed breaking change strands consumers on a release that silently broke them.

## What to write in the description

The first line of the markdown body becomes the headline in `CHANGELOG.md`. Keep it short, active, and specific. Mention the component or token name, not just the verb.

### Quality bar

> **Breaking-change changesets** must include a multi-paragraph migration guide in the markdown body covering:
>
> - the nature of the breaking change
> - the consumer-side action required (with before/after code or import-path examples where applicable)
> - any soft-data-loss, compatibility, or rollback implications
>
> **Non-breaking changesets** (minor additions, patches) may be one-liners.

The migration guide lives inside the same markdown file, below the frontmatter. Whatever you write there flows straight into the `CHANGELOG.md` entry, so write it for the downstream developer who has to upgrade — not for the reviewer of your PR.

## What happens after merge

1. Your PR merges to `main` with one or more `.changeset/*.md` files added.
2. The changesets GitHub action notices the pending changesets and opens (or updates) a PR titled "Version Packages." That PR bumps each affected package's `version`, prepends the new entries to its `CHANGELOG.md`, and deletes the consumed `.changeset/*.md` files.
3. A maintainer reviews the release PR and merges it.
4. On merge, the action publishes the new versions to npm and pushes the matching git tags.

If you need to amend a description after your feature PR has merged but before the release PR has been merged, edit the file inside the open release PR's branch (or land a follow-up PR that touches the changeset file). The release PR will refresh on its own.

## Example: non-breaking change

```markdown
---
'@unbranded-ds/react': minor
---

Add `<Tooltip>` component wrapping `@base-ui-components/react/tooltip`. Slots: Trigger, Content, Provider.
```

## Example: breaking change

This is the actual changeset that would have shipped spec 002's `@unbranded-ds/tokens` export cleanup, written to meet the quality bar:

````markdown
---
'@unbranded-ds/tokens': minor
'@unbranded-ds/react': patch
---

BREAKING: remove the wildcard exports `./dist/css/*` and `./dist/tailwind/*` from `@unbranded-ds/tokens`. Migrate to the clean aliases.

**Before:**

```css
@import '@unbranded-ds/tokens/dist/tailwind/preset.css';
@import '@unbranded-ds/tokens/dist/css/tokens-light.css';
```

**After:**

```css
@import '@unbranded-ds/tokens/preset.css';
@import '@unbranded-ds/tokens/themes/light.css';
```

The localStorage key for theme persistence also changed from `ds-theme` to `unbranded-ds-theme`. Users with the old key saved see the default theme on their first load after upgrade — their saved preference falls back to the default. No automatic migration is provided.
````

Note the bump levels: `@unbranded-ds/tokens` lands as `minor` because the package is pre-1.0 and breaking changes follow the pre-1.0 rule above. `@unbranded-ds/react` lands as `patch` because the React package itself didn't change shape — it only had to pick up the renamed token imports internally.
