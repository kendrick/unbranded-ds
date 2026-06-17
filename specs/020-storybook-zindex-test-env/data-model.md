# Phase 1 Data Model

This feature has no data entities and no persisted state. It is a test-environment and test-configuration change: no schema, no storage, no runtime data shape is introduced or modified.

For reference, the artifacts the change touches:

- **`TooltipStacksAboveDialog` story** (`packages/react/src/components/Dialog/Dialog.stories.tsx`) — the regression test being re-enabled. Change: `tags: ['!test']` removed; the stale quarantine comment removed.
- **Generated token CSS** (`packages/tokens/dist/css/tokens-*.css`) — read-only source of the `--z-index-*` values; not edited.
- **Storybook test config** (`apps/storybook/vitest.config.ts`, `.storybook/styles.css`, `.storybook/vitest.setup.ts`) — the surface that gains the z-index resolution fix.
- **Empty changeset** (`.changeset/*.md`) — frontmatter declares no package bump; present only to satisfy `changeset-check.yml`.

No entities, relationships, validation rules, or state transitions apply.
