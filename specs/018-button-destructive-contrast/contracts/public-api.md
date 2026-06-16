# Contract: public API additions

What this feature adds to the design system's public surface, and what stays stable.

## `@unbranded-ds/tokens`

Two canonical color tokens are added. They appear in every artifact the build emits, with no new wiring:

- **CSS variables** (per-cell, under each axis selector): `--color-destructive-subtle`, `--color-destructive-subtle-foreground`.
- **Tailwind utilities** (from the `@theme` preset, which maps every token): `bg-destructive-subtle`, `text-destructive-subtle-foreground`, plus the usual `border-*` / `ring-*` forms.
- **Token map** (`tokenMap`, the TS map and the token-query MCP): two entries keyed `color.destructive-subtle` and `color.destructive-subtle-foreground`, `category: 'color'`, `source: 'schema'`.
- **Zod schema** (`themeSchema` / `partialThemeSchema`): two required keys in the `color` category.
- **Contrast pairs** (`contrastPairs`): one new declared pair, `destructive-subtle-foreground` on `destructive-subtle`, threshold 4.5.

Stable (unchanged): `destructive` and `destructive-foreground` keep their values and their existing contrast pair, so any solid destructive usage is unaffected. No token is renamed or removed.

Compatibility: a consumer runtime theme that does not declare the new pair inherits the canonical default through the resolve-then-validate merge and continues to validate. A theme authored as a complete document must include the pair (as it already must include every other color token).

## `@unbranded-ds/react` — Button `destructive` variant

The `destructive` variant's public API is unchanged: `<Button variant="destructive">` takes the same props and renders the same element and semantics. What changes is its resolved styling:

- Background and text resolve to `bg-destructive-subtle` / `text-destructive-subtle-foreground` (token-backed utilities, no hardcoded color).
- The pair meets WCAG AA (≥4.5:1) in every shipped identity×color-scheme cell, at rest and on hover, on the page background and on card/muted surfaces.
- The hover state deepens the surface and the focus state keeps the destructive ring; both remain AA.
- The dark-mode-only class branches are removed; the per-cell tokens carry the light/dark difference.

A consumer who only reads the public prop surface sees no change; the fix is entirely in the resolved token values and utility classes.

## Validation contract

`validateTheme` / `validateResolved` / `validateComposedTheme` now also check the destructive-subtle pair. A theme whose merged result drops that pair below 4.5:1 fails with the existing structured shape:

```jsonc
{ "ok": false, "issues": [
  { "code": "CONTRAST_FAILURE",
    "path": "color.destructive-subtle-foreground / color.destructive-subtle",
    "ratio": <measured>, "threshold": 4.5,
    "message": "Contrast ratio <measured>:1 is below the required 4.5:1 threshold" }
]}
```

No new error code; the existing `CONTRAST_FAILURE` carries the new pair's path. This keeps the failure mode legible to agents pattern-matching on codes (Constitution XI.4).
