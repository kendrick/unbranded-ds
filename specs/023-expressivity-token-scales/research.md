# Phase 0 Research: Expressivity token scales

The clarify step resolved the user-facing decisions (emitted name `--tracking-*`, required keys, Tailwind-aligned scales with the skin adapting). This document records the implementation-shape decisions that follow from them.

## Decision 1 — Tracking lives in its own top-level `tracking` category

- **Decision**: Author tracking as a new top-level token category named `tracking`, a sibling of `color`, `typography`, `radius`, `motion`, etc., rather than as keys inside `typography`.
- **Rationale**: The clarify chose the emitted name `--tracking-*` (the Tailwind letter-spacing namespace). When the category is `tracking`, the build's default kebab name for `tracking.wide` is already `tracking-wide`, so it emits `--tracking-wide` with no rename. This mirrors the precedent set by `motion`, which is its own top-level category that emits Tailwind-aligned names. It also matches Tailwind v4's own structure, where letter-spacing (`--tracking-*`) is a separate theme namespace from font and text size.
- **Adjusts a spec assumption**: the spec's Key Entities call tracking "part of the typography category." That framing predates the emitted-name clarify; a sibling category is the natural, rename-free home for a `--tracking-*` scale and is invisible to consumers (they use the `tracking-*` utility or the `--tracking-*` variable regardless). The spec's intent — a tracking scale referenced like weight and leading — is preserved.
- **Alternatives considered**: keep tracking inside `typography` and special-case it in `sd.config.ts`'s `flattenedName` to rename `typography.tracking-*` → `tracking-*` (the motion-rename mechanism). Rejected as a needless rename hack when an own-category emits the target name directly, and because one typography key emitting a non-`--typography-` name is more surprising than a clean sibling category.

## Decision 2 — Tracking stops and values: Tailwind v4's letter-spacing scale

- **Decision**: Six stops matching Tailwind v4's defaults.

  | key | value |
  |-----|-------|
  | tighter | -0.05em |
  | tight | -0.025em |
  | normal | 0em |
  | wide | 0.025em |
  | wider | 0.05em |
  | widest | 0.1em |

- **Rationale**: Matches Tailwind so the `tracking-*` utilities resolve as consumers expect. Covers both extremes the fixtures need: `widest` (0.1em) for the LCARS console look, `tighter`/`tight` for the dense enterprise grid that comes next. `normal: 0em` gives a token for the default so a theme can reset tracking explicitly.
- **Alternatives considered**: a wider top stop (~0.18em) to match LCARS exactly — rejected by the clarify (the skin adapts to `widest`; the default vocabulary stays curated).

## Decision 3 — Radius steps and values: extend with Tailwind's xl/2xl/3xl

- **Decision**: Add three steps to the existing radius scale.

  | key | value | source |
  |-----|-------|--------|
  | xl | 0.75rem | new |
  | 2xl | 1rem | new |
  | 3xl | 1.5rem | new |

  The existing `sm 0.25 / md 0.375 / lg 0.5rem / full 9999px` are unchanged.
- **Rationale**: The existing `sm/md/lg` already match Tailwind v4, so `xl/2xl/3xl` continue the Tailwind scale and fill the gap between `lg` (0.5rem) and the full pill. LCARS's 1.75rem elbow routes to `3xl` (1.5rem), the nearest chunky stop, per the clarify.
- **Alternatives considered**: add `4xl` (2rem, also a Tailwind v4 default) so LCARS's 1.75rem rounds up rather than down. Deferred — `3xl` is close enough for the skin to read as intended, and `4xl` can be added later if a fixture needs it (that is exactly the audit signal the experiment is designed to produce).

## Decision 4 — Required keys, carried by the base sources

- **Decision**: The `tracking` category and the new `radius` keys are required in the strict `themeSchema`. The base DTCG sources (`tracking.json`, `radii.json`) carry default values for all of them.
- **Rationale**: Matches spec 008 (motion and the larger type sizes were added required). Because the base sources carry the values, `canonicalDefaultTokens` (regenerated into `defaults.generated.ts`) inherits them, and every built-in theme — which is a partial override merged onto the defaults — inherits them too, so no built-in theme JSON needs editing. The only break is for a fully-specified external consumer theme, announced by the version bump.
- **Validation path**: `partialThemeSchema.deepPartial()` still parses a partial consumer theme; the validator merges onto defaults and validates the complete result against the strict schema, which now requires the new keys. A fully-specified theme missing one gets the existing structured `{ ok: false, issues: [{ code, path, message }] }` error.

## Decision 5 — One small build-config edit; utilities light up automatically

- **Decision**: `sd.config.ts` needs one edit: add `"tracking"` to the `TokenCategory` union and the `categoryMap` in the `typescript/token-map` format. The CSS, Tailwind preset, and JSON emitters are category-agnostic and need nothing.
- **Rationale**: The build sources `src/tokens/**/*.json` and processes `allTokens` generically, so the CSS variables, the Tailwind preset, and the JSON map pick up a new `tracking.json` and the new radius keys with no change. The preset's `@theme inline` block maps every token to its variable, so `--tracking-*` and `--radius-*` produce the `tracking-*` and `rounded-*` utilities. The one non-generic emitter is the TS token map: its format string hardcodes a `TokenCategory` union and a `categoryMap`, so a brand-new top-level category (`tracking`) must be added there or the generated `tokens.ts` carries `category: "tracking"`, which the union rejects and `tsc` flags. Radius adds keys to an existing category, so it needs no such edit. The `flattenedName` rename stays motion-only.
- **Caught by**: `/speckit.analyze` (finding F1) — the original plan asserted no build-config change.

## Decision 6 — The token-query MCP surfaces the new tokens automatically

- **Decision**: No MCP code change; verify during implementation.
- **Rationale**: The MCP `palette` and `lookupToken` tools read the resolved token map / composed tokens, which the build regenerates from the sources. Spec 008 established that the `palette` tool returns whatever categories the resolved data carries. The new `tracking` category and radius keys appear once the sources and defaults carry them. Implementation includes a check that `lookupToken('tracking.widest')` and `palette('tracking')` resolve.

## Decision 7 — No contrast or a11y impact

- **Decision**: The contrast suite and the a11y guard are expected to stay green unchanged.
- **Rationale**: Tracking and radius are not color, so they touch no `contrastPairs`. Rerouting the LCARS fixture's letter-spacing and corner radius from raw values to tokens changes only which token supplies the value, not the rendered text/background contrast. The Storybook a11y pass over the LCARS stories should remain clean in light and dark.

## Decision 8 — Asymmetric radius composes from the scale

- **Decision**: Document, in THEMING.md, that an asymmetric (per-corner) radius is composed from radius tokens, e.g. `border-radius: var(--radius-3xl) 0 var(--radius-3xl) 0`.
- **Rationale**: This already scores zero in the audit (every length is a token). The only thing missing was a chunky-enough step, which Decision 3 adds. No new per-corner token type is introduced (out of scope per the spec).

## Decision 9 — Reference-skin reroute mapping

- **Decision**: In `fixtures/themes/lcars/parts.css`, replace the raw values:
  - `letter-spacing: 0.18em` → `var(--tracking-widest)` (header)
  - `letter-spacing: 0.1em` → `var(--tracking-widest)` (title)
  - `letter-spacing: 0.12em` → `var(--tracking-widest)` (button)
  - `border-radius: 1.75rem 0 1.75rem 0` → `var(--radius-3xl) 0 var(--radius-3xl) 0` (card)
  - `border-radius: 1.75rem 0 0 0` → `var(--radius-3xl) 0 0 0` (card-header)
- **Rationale**: Routes every flagged raw value through a token. Expected audit result: `EXPRESSIVITY BLOCKERS: 0` (SC-001). The three tracking values collapse onto `widest`; if the title/button want a half-step less, `wider` (0.05em) is available, but `widest` keeps the LCARS look.

## Decision 10 — Test impact and version bump

- **Decision**: Check `schema.test.ts` and `token-map.test.ts` for assertions that pin the exact category or token set; update them to include the new tokens. `axes.test`, `registry.test`, and `listThemes.test` are unaffected (no themes added or removed). Bump `@unbranded-ds/tokens` 0.5.0 → 0.6.0 (minor, the pre-1.0 convention for a required-key addition, per spec 008's 0.2.0 bump).
- **Rationale**: Adding tokens changes the regenerated `defaults.generated.ts` and the token map; the regenerate-and-diff guard (`defaults.test`) passes once both sources and defaults are updated together. Any test that asserts an exact token inventory needs the new entries.
