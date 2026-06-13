# Contract: The discovery audit (US1, the gate)

The first deliverable, and the gate every rename traces to. No rename starts before this is reviewed and approved.

## Output

One reviewed document (e.g. `packages/react/AUDIT-xi2.md`), a table of audit entries covering EVERY component, so the audit is provably complete.

```
| component | kind        | current         | canonical (upstream-default) | blast radius                  | codemod    | disposition | status    |
|-----------|-------------|-----------------|------------------------------|-------------------------------|------------|-------------|-----------|
| Tooltip   | polymorphic | as              | render                       | Tooltip.tsx, .usage.md, story | mechanical | deprecate   | flagged   |
| Button    | prop        | (variant)       | (variant)                    | —                             | —          | —           | compliant |
| Dialog    | slot        | (Content)       | (Content)                    | —                             | —          | —           | compliant |
| ...       | ...         | ...             | ...                          | ...                           | ...        | ...         | ...       |
```

## Rules the audit follows

- **Canonical defaults to upstream.** A flagged entry's `canonical` is shadcn/Base UI's name for that concept; XI.2's generic name is the fallback only where upstream is silent.
- **Only our own drift is flagged.** A prop/slot inherited unchanged from upstream is `compliant`, never flagged. Public slots that already follow shadcn (`Content`/`Trigger`/`Item`) are `compliant`; Base UI's internal `Popup`/`Positioner` are not public slots and are out of scope.
- **Conflicts resolve to one canonical name** before any rename, so the vocabulary stays internally consistent (FR-003).
- **Every component appears**, compliant or flagged, so coverage is verifiable.

## The review gate

Approval is recorded before any rename lands. The renames in Phase B draw ONLY from `flagged` + approved entries. Grounding suggests the flagged set is small (the polymorphic `as` tail, plus any drift the audit surfaces); the audit's job is to prove that rather than assume it.
