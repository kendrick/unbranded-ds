# Quickstart: Token schema growth

How to implement and verify spec 008. All work is in `packages/tokens` plus root `THEMING.md`.

## Prerequisites

- Branch `008-token-schema-growth` checked out
- `pnpm install` done
- Working from `packages/tokens` for most steps

## Build + verify loop

The token pipeline regenerates `dist/` from `src/tokens/**` + `themes/*.json`:

```bash
pnpm --filter @unbranded-ds/tokens build      # tsx sd.config.ts + tsc
pnpm --filter @unbranded-ds/tokens test        # vitest (schema, validate, runtime, color)
pnpm typecheck                                 # whole workspace
```

After a token addition, confirm it lands in all four artifacts:

```bash
grep -- "--ease-standard\|--duration-base\|--typography-font-serif\|--ring-width" packages/tokens/dist/tailwind/preset.css
grep "motion\|font-serif\|ring\|z-index" packages/tokens/dist/ts/tokens.ts
grep "font-serif\|ease\|duration" packages/tokens/dist/json/tokens.json
grep -- "--ease-standard" packages/tokens/dist/css/tokens-brand.css   # per-theme CSS
```

## Implementation order (mirrors the plan's tracks)

Tracks A and B are independent — do them in parallel if splitting work.

**Track A — token additions**

1. Add `src/tokens/motion.json` (durations + easings, DTCG types per contract).
2. Edit `src/tokens/typography.json` — add `font-serif`, `size-2xl`, `size-3xl`.
3. Add `src/tokens/ring.json` and `src/tokens/z-index.json` (optional defaults).
4. Edit `src/schema.ts` — `motionTokens` (required), typography keys (required), `ringTokens` + `zIndexTokens` (optional); loosen category objects for partial themes; export the default token set for the merge.

**Track B — validator (independent)** 5. Add a `resolveTheme(partial)` deep-merge helper (defaults under override). 6. Edit `src/validate.ts` — resolve before validating; check completeness + contrast on the merged result; stop skipping a pair when one side is absent. 7. Edit `src/runtime.ts` — apply the same resolve before the post-conversion contrast pass. 8. Add fixtures: a partial theme, an inherited-pair theme that should fail contrast, a color-only legacy theme that should still pass.

**Then converge** 9. Edit `sd.config.ts` — extend `categoryMap` + `TokenCategory` union; special-case the motion category's var naming (`--ease-*`, `--duration-*`). 10. Edit `themes/brand.json` — add a `radius` override + a `typography` override (Q3 multi-category demo). Leave `light`/`dark` color-only.

**Then docs + release** 11. Edit `THEMING.md` — three additions (run through the humanizer before merge): - "Extending the schema" walkthrough using motion as the worked example. - "Overriding non-color tokens" subsection pointing at the enriched `brand.json`. - The token-source-override vs runtime-theme distinction, with a complete example of each. 12. `pnpm changeset` — `@unbranded-ds/tokens` minor; the react patch is automatic.

## Verification against the spec

```bash
# US1: new tokens resolve
pnpm --filter @unbranded-ds/tokens build && grep -- "--ease-standard" packages/tokens/dist/css/tokens-light.css

# US2: partial runtime theme validates against the merged result
pnpm --filter @unbranded-ds/tokens test   # the new partial/inherited-pair fixtures

# US4: optional tokens present + a theme omitting them still builds
grep -- "--ring-width\|--z-index-overlay" packages/tokens/dist/tailwind/preset.css

# Release
ls .changeset/*.md
```

## Watch-outs

- **Motion var naming is the one special case.** Every other category emits `--{category}-{key}`; motion emits `--ease-*` / `--duration-*`. Don't let the build emit `--motion-*`.
- **The contrast skip is in two files.** `validate.ts` and `runtime.ts` both have `if (!fg || !bg) continue`. Fix both.
- **Built-in themes inherit the required tokens** from `src/tokens` defaults; don't duplicate font-serif/motion/sizes into `light`/`dark`/`brand`.
- **Optional means optional.** `ring` and `z-index` must validate when omitted — they live in defaults, not in the required schema.
- **SSR safety**: no browser globals in the validator merge path; `registerTheme` already guards `document` usage at call time.
