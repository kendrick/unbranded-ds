# Contract: Token-query MCP, multi-axis + extension tokens (v2)

Changes layered onto `specs/005-agent-experience-foundation/contracts/token-query-mcp.md`. Four tools, same names (the `tools/list` smoke test is unchanged). `SERVER_VERSION` bumps with the package.

## Shared input: the axis object

The `theme` parameter on `lookupToken`, `palette`, and `contrast` changes from `theme?: string` to:

```ts
theme?: { aesthetic?: string; density?: string }   // omit a key to skip that axis
```

- Omitted entirely or empty → `{ aesthetic: 'light' }` (preserves the pre-009 default; single-axis still works).
- An axis naming an unrecognized theme contributes nothing; the other axes still resolve (the unknown axis is reported, not fatal).
- Each tool resolves via `composeAxes(theme)` → `composeTokens` (density over aesthetic). No tool merges on its own.

## `lookupToken`

- **Output** adds `source: 'schema' | 'theme-extension'`.
- A token in `tokenMap` and the composed tree → `{ source: 'schema', present: true, value, cssVariable }`.
- A token absent from `tokenMap` but present in the composed tree → `{ source: 'theme-extension', present: true, value, cssVariable }` with `cssVariable` synthesized from the dot-path (`shadows.neon` → `--shadow-neon`). The old hard-reject of non-schema tokens is removed.
- A token that is a real extension in some bundled theme but absent from the active composition → soft `{ source: 'theme-extension', present: false, note }` (NOT an error) so the caller learns it is theme-scoped.
- A token in no theme at all → hard `unknown-token` error (unchanged).

## `palette`

- **Input** `theme` becomes the axis object.
- **Output** each token entry adds `source`: `tokens: Array<{ name, value, source }>`. `walkSubtree` already returns extension leaves; the change is tagging each by `tokenMap` membership.

## `contrast`

- **Input** `theme` becomes the axis object. Compose once, resolve each token-reference side against the composed tree (don't re-resolve per side).

## `listThemes`

- **Output** reports each theme's axis (so a caller knows what to put in `aesthetic` vs `density`), and gains `vaporwave`/`compact` descriptions.

## Source classification (computable without the build change)

`source` is derived from `tokenMap` membership at query time, so the MCP work does not block on the build-side `source` field landing. A small startup union of all extension tokens across bundled themes powers the "real extension, absent here" classification.

## Contract doc edits (FR-017)

Update `token-query-mcp.md`: the three `theme?` inputs → the axis object; `palette`/`lookupToken` outputs gain `source`; `lookupToken` errors narrow (extension-absent is a soft success, not `unknown-token`); a new prose section on the axis model + precedence + the `source` discriminator; the version note. All prose through the humanizer.
