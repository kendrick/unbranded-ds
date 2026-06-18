# Quickstart: Expressivity token scales

## Using the new tokens

Wide all-caps tracking through a token (instead of a raw `letter-spacing`):

```css
[data-theme="my-skin"] [data-slot="card-title"] {
	letter-spacing: var(--tracking-widest); /* or tracking-wide / tracking-wider */
	text-transform: uppercase;
}
```

Or via the Tailwind utility on a component:

```tsx
<CardTitle className="tracking-widest uppercase">Navigation</CardTitle>
```

A chunky, asymmetric "elbow" corner, composed per-corner from radius tokens (no raw length):

```css
[data-theme="my-skin"] [data-slot="card"] {
	border-radius: var(--radius-3xl) 0 var(--radius-3xl) 0;
}
```

A theme overrides the scales like any other category (partial is fine; the rest inherits):

```json
{
	"tokens": {
		"tracking": { "widest": "0.15em" },
		"radius": { "3xl": "1.75rem" }
	}
}
```

## Verifying the change

From the repo root, after editing the schema and sources:

```bash
# 1. Rebuild the tokens (regenerates dist + defaults.generated.ts)
pnpm --filter @unbranded-ds/tokens build

# 2. Tokens tests: schema, validation, contrast, defaults regenerate-and-diff
pnpm --filter @unbranded-ds/tokens test

# 3. The acceptance metric: the reference skin reads zero blockers
node scripts/expressivity-audit.mjs            # EXPRESSIVITY BLOCKERS: 0

# 4. The invariant contract: the skin stays accessible under the new tokens
pnpm --filter @unbranded-ds/react build        # the fixture imports the built package
pnpm --filter @unbranded-ds/storybook exec vitest run --project storybook -t "LCARS"
```

## Definition of done (acceptance)

- `node scripts/expressivity-audit.mjs` prints `EXPRESSIVITY BLOCKERS: 0` (down from 5) — SC-001.
- The LCARS stories pass the a11y test-runner in light and dark — SC-002.
- The tokens test suite is green, including `defaults.test` (regenerate-and-diff) and `themes-contrast.test` — SC-003.
- A theme author can express wide/tight tracking and chunky/asymmetric corners with no raw length on a design-system node — SC-004.
- THEMING.md documents the tracking scale and the per-corner radius composition (humanized).
- A `.changeset/*.md` declares the `@unbranded-ds/tokens` minor bump.
