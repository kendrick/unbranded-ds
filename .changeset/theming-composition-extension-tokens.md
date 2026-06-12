---
'@unbranded-ds/tokens': minor
---

Multi-axis theme composition and first-class theme-extension tokens.

A consumer can apply an aesthetic theme (`data-theme`) and a density theme (`data-density`) at once; the page resolves to the union of the two, with density winning a collision via the cascade `@layer` order. Themes now live under `themes/<axis>/`, and two demo themes ship: `vaporwave` (aesthetic) and `compact` (density). A theme may declare tokens the schema does not (vaporwave's `shadow.neon` glow); those are now typed in the token map and visible through the token-query MCP, each carrying a `source: 'theme-extension'` discriminator.

The MCP tools take a multi-axis `theme` input and resolve through one shared `composeTokens` resolver, the same one the validator and runtime use, guarded by a cross-surface parity test so the resolver, the emitted CSS, and the MCP cannot drift. That test immediately caught a latent base-token regression: `color.muted-foreground` and `color.destructive` in the base sources were never brought to AA alongside the light theme in spec 008, so any theme inheriting them shipped failing-contrast CSS. Both are now corrected.

Amends Constitution Section III (1.1.1 to 1.2.0) to name the axes and the precedence. Additive and non-breaking: single-axis `data-theme` keeps working, and the typed token map's new `source` field is optional.
