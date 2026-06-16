# Spec 018 — Fix the Button `destructive` variant's AA contrast

**Target version:** patch or minor on `@unbranded-ds/react` (and possibly `@unbranded-ds/tokens` if the fix is a new token)
**Depends on:** nothing
**Blocks:** a fully light-mode-correct example app, and the Storybook a11y gate once it runs in a real browser (see spec-019)
**Status:** brief (not yet specified)

> Captured on 2026-06-16 while building spec 016 (the color-scheme axis split). The example app's Playwright axe pass on `/` failed the moment the page rendered design-system light tokens: the destructive button is 4.1:1, below AA. Recorded so the fix is real work, not a footnote.

## The problem

The Button `destructive` variant is a soft tint, not a solid fill:

```
destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 …'
```

So it renders the full destructive color as **text** on a 10%-destructive tint. For the default light palette that is `#da2d33` text on `#fbeaeb`, which axe measures at **4.1:1** — under the 4.5:1 WCAG AA threshold for normal text. The same shape fails for any light-ish scheme where the tint stays pale (default-light, brand-light, vaporwave-light); dark schemes tend to clear it because the tint is dark and the text is brighter (vaporwave-dark passes today).

The token validator never caught this because it checks `destructive-foreground` against `destructive` (white on the solid red, which the variant does not actually use), not `text-destructive` against the tinted surface. The bug stayed invisible until spec 016 made a consumer render DS light tokens: spec 015's example never imported `light.css` (light fell back to browser defaults), so its destructive button was unstyled and axe passed it. Spec 016's example deliberately keeps `light` as the file-less base for the same reason, which sidesteps the failure rather than fixing it.

## The fix

Make the destructive button meet AA. A few shapes, roughly in order of least surprise:

- Author a token pair for the soft style — a `destructive-muted` surface and a `destructive-strong` (or reuse `destructive`) text color chosen so the pair clears 4.5:1 in every shipped cell, and point the variant at those. Most faithful to the current soft look.
- Switch the variant to the shadcn-current solid fill (`bg-destructive text-destructive-foreground`), which already validates (white on the solid red passes). Simplest, but changes the visual design.
- Darken the `text-destructive` to a fixed darker destructive shade only for text, leaving the tint.

Whichever shape wins, add a `destructive`-text-on-surface contrast pair to `contrastPairs` in `packages/tokens/src/schema.ts` so the validator guards it going forward (the same way spec 016 added `muted-foreground`/`background`). Then the example can import `light.css` and render a properly styled default-light.

## What it touches

- `packages/react/src/components/Button/Button.tsx` (the `destructive` CVA entry).
- Possibly `packages/tokens` (a new token + the six palettes if a `destructive-muted`/`destructive-strong` pair is introduced) and `contrastPairs` in `schema.ts`.
- `examples/nextjs-15-app-router/app/globals.css` can re-add the `light.css` import once the pair passes.
- A changeset.

## Open questions

- Keep the soft tint (new tokens) or move to a solid destructive button (design change)?
- Does the soft style need to hold across all six identity×scheme cells, or only the default? If all, the new pair joins the per-cell AA matrix.
- Should the validator's new pair be `destructive`/`background` (the tint approximates the background) or an explicit `destructive`/`destructive-muted` pair?

## Scope guardrails

This is a Button-and-destructive-token fix, not a re-theming. It does not touch the axis model. The destructive *color* itself is the untouched base token set; the bug is the variant's use of it as text on a pale tint, so the fix can be contained to the variant plus one guarding contrast pair.
