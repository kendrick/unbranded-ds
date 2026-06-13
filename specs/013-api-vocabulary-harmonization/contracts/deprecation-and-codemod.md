# Contract: Deprecation window + codemods

How a breaking rename reaches consumers softly (FR-010, FR-011).

## Deprecation window (the default disposition)

For one minor, a renamed prop accepts BOTH names. The old name is mapped onto the new one and emits a structured warning; it is removed the next minor.

```ts
// per-component alias, at the top of the component body
if (oldName !== undefined) {
  warn({
    code: 'deprecated-prop',
    path: 'Tooltip.as',
    message: '`as` is deprecated; use `render`. It will be removed next minor.',
  });
  newName ??= oldName; // the new name wins if both are passed
}
```

- The warning uses the existing `warn()` helper (`{ code, path, message }`), so a deprecation notice is machine-parseable, not prose.
- Both-passed: the new name wins (a consumer mid-migration is not broken).
- The audit may pick `hard-break` for a specific rename where a soft landing is impractical; then there is no alias, and the migration note + codemod carry the consumer.

## Codemods (the mechanical renames)

One jscodeshift transform per mechanical rename, under `codemods/`, so a consumer migrates with one command.

```
codemods/
├── as-to-render.ts          # JSX attribute rename: as= → render=  (where it maps cleanly)
└── <other-mechanical>.ts    # one per flagged mechanical entry
```

- Each transform is tested against a sample consumer snippet (before → after).
- A `manual`-flagged entry (a non-mechanical change) gets a documented migration step in the note instead of a codemod.
- The migration note (changeset + CHANGELOG) enumerates every rename old→new, and points at the codemod command for the mechanical ones.

## Invariant

A consumer can migrate every mechanical rename with one codemod command; during the deprecation window the old name still works and warns (structured); after it, only the new name works. No rename changes behavior beyond the name.
