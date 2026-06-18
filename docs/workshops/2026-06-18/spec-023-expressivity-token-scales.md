# Spec 023 — Expressivity token scales (tracking and larger radii)

**Target version:** `@unbranded-ds/tokens` minor bump (two new token scales; see the required-vs-optional note in Scope)
**Depends on:** the expressivity-audit spike (`kendrick/expressivity-spike`): the audit and the LCARS fixture that surfaced these gaps and will verify they close
**Blocks:** LCARS reaching zero expressivity blockers (its ship-readiness signal); the next divergent fixtures build on the richer scales
**Status:** brief (not yet specified)

> Surfaced on 2026-06-18 by the expressivity experiment. LCARS, the first divergent skin, was authored as an honest attempt through sanctioned channels only: its color, flat surfaces, and condensed type rode the validated theme pipeline and scored zero, and only what the token schema couldn't say landed in an audited CSS layer. The audit read 5 blockers, all from two missing token scales. This spec closes them, which takes LCARS to zero.

## Motivation

The expressivity audit ([fixtures/README.md](fixtures/README.md)) counts every place a skin has to leave the design system to get the look it wants. LCARS came out at 5, and the breakdown is narrow: 3 in `type`, 2 in `shape`, every one a raw value applied because no token existed for it. Everything else LCARS wanted went through the validated pipeline cleanly.

So the experiment's first backlog isn't a redesign. It's two scales the token system is missing. Add them, reroute the LCARS fixture through them, and the count drops to zero—which is both the proof that the find-grow-recheck loop works end to end and, by the experiment's own rule, the signal that LCARS could ship as a real identity. We hold off shipping it; the zero is the point.

## The two gaps

### Tracking (letter-spacing)

The typography category has font families, sizes, weights, and leadings, but no letter-spacing. LCARS sets wide all-caps tracking on its panels and controls, so it applies raw `letter-spacing: 0.18em` (and 0.1em, 0.12em) directly. Three blockers, one cause.

The fix is a `tracking` scale, the same shape as the existing weight and leading scales. A scale, not a single value, because the next fixtures pull the other way: a dense enterprise grid wants tight tracking, not wide. Tailwind v4 maps a `--tracking-*` custom property to its `tracking-` utilities, so the emitted-name decision matters (see Scope).

### Larger radii

This one looked like "asymmetric radius support" and isn't. You can already compose an asymmetric corner from the existing scalar tokens: `border-radius: var(--radius-lg) 0 var(--radius-lg) 0` routes every length through a token and scores zero. The real gap is the scale itself. It runs `sm 0.25 / md 0.375 / lg 0.5rem` and then jumps straight to `full` (a 9999px pill), with nothing in the chunky range (around 1.75rem) LCARS's elbow panels want, so LCARS reaches for a raw `1.75rem`.

The fix is larger steps on the existing radius scale (working set: `xl`, `2xl`, maybe `3xl`), plus a documented note that asymmetric radii compose per-corner from the scale. LCARS then routes its elbow through `var(--radius-2xl)` or the nearest step, accepting the token's value the way an honest fixture should.

## Scope

- Schema ([packages/tokens/src/schema.ts](packages/tokens/src/schema.ts)): add a `tracking` scale to the typography category, and larger steps to the radius category.
- Token sources ([typography.json](packages/tokens/src/tokens/typography.json), [radii.json](packages/tokens/src/tokens/radii.json)): add the values. Regenerate `defaults.generated.ts` so the canonical baseline and its regenerate-and-diff guard stay consistent.
- Emitted-name decision (clarify): does tracking emit `--tracking-*` (Tailwind's letter-spacing namespace, the way motion emits `--duration-*` and `--ease-*`) or `--typography-tracking-*` (consistent with the other typography tokens)? Pick one and route it through the `flattenedName` transform in [sd.config.ts](packages/tokens/sd.config.ts) if it needs the motion-style rename. Larger radii stay `--radius-*`, already Tailwind-aligned.
- Required-vs-optional (clarify): new required keys are the simplest and match spec 008, and because the base sources carry them the canonical defaults inherit them, so the built-in themes need no edits. The only cost falls on a fully-specified external consumer theme, announced by the version bump. Confirm this read during clarify.
- Reroute the LCARS fixture ([fixtures/themes/lcars/parts.css](fixtures/themes/lcars/parts.css)) through the new tokens: tracking via `var(--tracking-…)`, the elbow via a radius token per corner.
- Re-run `node scripts/expressivity-audit.mjs` and confirm LCARS reads 0.
- Confirm the guards stay green: the token-level contrast suite ([themes-contrast.test.ts](packages/tokens/src/themes-contrast.test.ts)) and the Storybook a11y pass over the LCARS stories.
- THEMING.md: a short note on the tracking scale and on composing asymmetric radii from the scale (humanized).

## Out of scope

- Asymmetric or per-corner radius as its own token: it composes from the scale already.
- Density and touch-target tokens: a separate axis, deferred (the enterprise-grid fixture will make the case for them).
- The next fixtures themselves (enterprise grid, glass console): they consume these scales but are their own briefs.
- Shipping LCARS as a registered product identity: it stays a fixture until the experiment says otherwise.

## Acceptance criteria

- The Zod schema declares the `tracking` scale and the larger radius steps; the values live in the DTCG sources and flow through to all four build artifacts.
- The new tokens resolve as Tailwind utilities (the `tracking-*` and rounded utilities) per the emitted-name decision.
- `defaults.generated.ts` regenerates with the new keys and its regenerate-and-diff test passes.
- The LCARS fixture, rerouted through the new tokens, reads `EXPRESSIVITY BLOCKERS: 0`.
- Both LCARS cells stay AA in the contrast suite, and the Storybook a11y pass over the LCARS stories stays clean in light and dark.
- THEMING.md explains the tracking scale and the per-corner radius composition.
- The version bump is published.

## Constitution check

- The canonical token schema is locked at build time, and growing it is the sanctioned move (precedent: spec 008). This spec grows two scales; it does not loosen the lock.
- Adding required keys is a breaking change pre-1.0, announced by the version bump.
- THEMING.md additions pass through the humanizer; no padded three-item lists.
- No new components, so the sidecar `*.usage.md` rule does not apply.

## References

- [fixtures/README.md](fixtures/README.md) and [fixtures/expressivity-report.json](fixtures/expressivity-report.json): the audit, the harness, and the LCARS findings this spec closes.
- Spec 008 (token schema growth): the precedent for adding token categories and scales, and the required-key breaking-change pattern.
- [packages/tokens/src/schema.ts](packages/tokens/src/schema.ts), [typography.json](packages/tokens/src/tokens/typography.json), [radii.json](packages/tokens/src/tokens/radii.json): the schema and sources this spec edits.
- [packages/tokens/sd.config.ts](packages/tokens/sd.config.ts): the build, for the emitted-name decision.
- [fixtures/themes/lcars/parts.css](fixtures/themes/lcars/parts.css): the audited layer that reroutes to zero.
