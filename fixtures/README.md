# Expressivity Fixtures

This directory is an experiment: proving `unbranded-ds` can be skinned into wildly divergent looks, proving it mechanically, while the accessibility contract holds across every skin.

## The Idea

You can't measure "can it build LCARS." You can measure the thing underneath: how often a skin has to leave the design system to get the look it wants. Each such moment is an expressivity blocker—a raw literal on a DS node, an `!important`, a reach into an unnamed internal, a deep import, an escape hatch. The fixtures are read-only honest attempts; the only way to drive the count down is to make the DS more expressive. Zero blockers means the look was reachable through sanctioned channels alone.

## How a Fixture Is Built

A skin uses two layers, and only two:

- **The validated pipeline.** Everything the token system can already express (color, spacing, type family, flat-vs-elevated surfaces) is authored as a real theme identity under `packages/tokens/themes/theme/<skin>/`, run through the same Style Dictionary + Zod + contrast validation as the shipped themes. It scores zero by construction, and its colors are WCAG-checked before they ever render.
- **The audited layer.** Whatever the token schema can't say yet goes in `<skin>/parts.css`, targeting published `data-slot` parts. Every raw value there is a blocker the audit counts, which makes the audited layer a precise readout of the token system's gaps.

The composition (`<skin>/*.stories.tsx`) reaches for nothing private: public components and variants only.

## The Harness

```bash
# Score the corpus. Emits fixtures/parts.manifest.json + fixtures/expressivity-report.json.
node scripts/expressivity-audit.mjs --emit

# The invariant-contract guard: axe runs against every skin, both color schemes.
pnpm --filter @unbranded-ds/storybook test:storybook
```

The contract is the whole point. A skin may add any expressive surface it likes, but if it drops an axe violation or breaks the keyboard path, the test fails. That's the claim worth defending: range under an invariant contract.

## Where It Stands

One skin so far, **LCARS**, and the audit reads 5 blockers, every one a real gap:

| Axis  | Count | What LCARS needed        | The DS gap                                                      |
| ----- | ----- | ------------------------ | -------------------------------------------------------------- |
| shape | 2     | asymmetric "elbow" radii | radius tokens are scalar (sm/md/lg/full); no per-corner channel |
| type  | 3     | wide all-caps tracking   | no `letter-spacing` token exists                               |

Everything else LCARS wanted (its amber/mauve/black palette, flat shadowless surfaces, condensed type) went through the validated pipeline cleanly, contrast-checked, zero blockers. Both LCARS cells pass the token-level contrast suite, and the rendered axe pass is clean in light and dark.

That table is the backlog. The two gaps, a tracking (letter-spacing) token and a way to express asymmetric radii, are the first entries for spec 023. More skins (a dense enterprise grid, a glass-and-glow console) will surface the axes LCARS doesn't touch: texture, motion, density.
