# Contract: Token scales (tracking + extended radius)

The tokens package exposes its tokens as a public contract: the emitted CSS variables, the Tailwind utilities those generate, the typed token map, and the Zod validation shape. This document states what 023 adds to that contract.

## Emitted CSS variables

New variables, present in every per-cell `dist/css/tokens-*.css` (scoped under the cell selector) and mapped in `dist/tailwind/preset.css`:

```
--tracking-tighter  --tracking-tight  --tracking-normal
--tracking-wide     --tracking-wider  --tracking-widest
--radius-xl         --radius-2xl      --radius-3xl
```

Existing variables are unchanged in name and value.

## Tailwind utilities

The preset maps each variable, so these utilities resolve:

```
tracking-tighter … tracking-widest      (letter-spacing)
rounded-xl  rounded-2xl  rounded-3xl     (border-radius)
```

A theme author or component reaches the tokens through the utility or the variable; neither requires importing from `@unbranded-ds/tokens` at runtime (Constitution IV).

## Typed token map

`dist/ts/tokens.ts` gains entries for each new token, with `category: "tracking"` for the tracking scale and `category: "radii"` for the new radius steps, each carrying its `cssVariable`. `dist/json/tokens.json` gains the same entries. Downstream consumers (Figma sync, agents, the token-query MCP) read these.

## Validation contract

`validateTheme()` and `registerTheme()` continue to return the typed `{ ok: boolean, issues: ValidationIssue[] }` shape. The only change:

- A complete (fully-specified) theme MUST now declare the `tracking` category and the new radius keys. A theme that omits a required new key fails with a structured issue:

```jsonc
{ "ok": false, "issues": [ { "code": "...", "path": "tracking.widest", "message": "..." } ] }
```

- A partial theme (the common case) that omits them still validates: the missing keys inherit `canonicalDefaultTokens`. This is unchanged behavior; only the set of required keys grew.

Contrast validation is unaffected: the `contrastPairs` reference only color tokens, and tracking and radius are not color.

## Token-query MCP

No tool signature changes. `palette('tracking')` returns the resolved tracking values; `lookupToken('tracking.widest')` resolves to its value and `--tracking-widest` variable; the new radius keys appear in `palette('radius')`. These are automatic once the sources carry the tokens (the tools read the resolved map), and are verified during implementation rather than coded.

## Backward compatibility

- Every pre-existing token keeps its name and value (SC-003), so no existing theme's rendered output changes.
- The added required keys are a breaking change only for a fully-specified external consumer theme, announced by the `@unbranded-ds/tokens` minor bump (0.5.0 → 0.6.0).
