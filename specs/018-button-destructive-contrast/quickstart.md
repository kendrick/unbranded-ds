# Quickstart: verifying the accessible destructive Button

The order mirrors how spec 016 was verified — author and prove the palettes first, then let the build and tests confirm the chain.

## 1. Author and prove the token values

For each of the six cells, set `color.destructive-subtle` and `color.destructive-subtle-foreground`, then check the pair with the package's own contrast math before wiring anything:

```bash
# a throwaway tsx check importing ./src/color.ts (as used for the 016 palettes):
# parseColor + contrastRatio over the two values per cell — target >= 5:1 at rest.
pnpm --filter @unbranded-ds/tokens exec tsx <your-check>.mts
```

Every cell should report ≥5:1 (headroom so the hover darken stays ≥4.5:1).

## 2. Build the tokens

```bash
pnpm --filter @unbranded-ds/tokens build
```

Emits `--color-destructive-subtle` and `--color-destructive-subtle-foreground` into each per-cell CSS file, the Tailwind preset utilities, the token map (`source: 'schema'`), and regenerates `src/defaults.generated.ts`.

## 3. Validate the matrix

```bash
pnpm --filter @unbranded-ds/tokens exec vitest run
```

- `themes-contrast.test.ts` now exercises the new pair across all six cells (it iterates `contrastPairs`); all pass.
- `schema.test.ts` reflects the new pair count and the two new color keys.
- `defaults.test.ts` regenerate-and-diff stays green.

## 4. Verify the Button

```bash
pnpm --filter @unbranded-ds/react exec vitest run
pnpm --filter @unbranded-ds/react build
```

The `destructive` variant resolves `bg-destructive-subtle` / `text-destructive-subtle-foreground`; its unit test asserts the classes, and the Destructive story carries a `play` and passes axe.

## 5. Re-enable light in the example and scan it

Re-add the light import to `examples/nextjs-15-app-router/app/globals.css`:

```css
@import '@unbranded-ds/tokens/themes/light.css';
```

Then:

```bash
pnpm --filter @unbranded-ds/example-nextjs exec tsc --noEmit
pnpm --filter @unbranded-ds/example-nextjs e2e
```

The Playwright axe pass on `/` and `/showcase` is clean — the destructive button in the gallery now meets AA in default-light, the regression spec 016 sidestepped.

## 6. Changeset and full local CI

```bash
# add .changeset/*.md: @unbranded-ds/tokens minor + @unbranded-ds/react minor
pnpm typecheck && pnpm build && pnpm test:unit
pnpm exec tsx scripts/validate-sidecars.ts
pnpm --filter @unbranded-ds/storybook build
```

## Done when

- All six cells pass the destructive-subtle pair at ≥4.5:1 (the matrix test is green).
- A deliberately failing destructive value makes the build fail with a `CONTRAST_FAILURE` naming the pair (proves the guard).
- The example's `/` axe pass is clean with light loaded.
- The destructive button still reads as destructive in every cell (design review).
