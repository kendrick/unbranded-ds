# Spec 022 — Popover tokens and the Dialog description contrast failure

**Target version:** `@unbranded-ds/tokens` and/or `@unbranded-ds/react` (TBD — see below)
**Depends on:** spec 020 (the test-runner layer-order fix that surfaced this)
**Blocks:** removing the `color-contrast` quarantine on the two Dialog stories
**Status:** brief (not yet specified)

> Captured on 2026-06-16 while implementing spec 020. Until spec 020, the Storybook test-runner never applied design system token styling — a cascade layer-order bug shadowed every token, so the axe accessibility gate had been computing contrast against unstyled components. With tokens now resolving, the gate is real for the first time, and it immediately caught two genuine, pre-existing problems. Recorded so they are tracked, not buried under the quarantine spec 020 had to add to ship.

## What surfaced

Two issues, probably related.

First, `DialogDescription` text fails WCAG AA contrast. The description uses `text-muted-foreground` (`#6f6f78`, `--color-muted-foreground`). When a dialog is open, axe computes its contrast at 3.98:1 against the background it resolves to (`#e6e6e7`), below the AA floor of 4.5:1 for normal text. It fails on every story that opens a dialog — currently `OpenCloseInteraction` and `TooltipStacksAboveDialog`.

Second, `--color-popover` and `--color-popover-foreground` are undefined. `DialogContent`, `Tooltip.Content`, and `Select.Content` all style themselves with `bg-popover` and `text-popover-foreground`, but the token build emits no such custom properties (the only `popover` token is `--z-index-popover`). So those surfaces have no real background or foreground color of their own. This is the strong suspect behind the contrast failure: with no `bg-popover`, the dialog panel has no opaque background, and the muted-foreground description ends up measured against whatever shows through.

## The fix (to investigate)

- Decide whether `popover` is a real token the design system should define (a `--color-popover` / `--color-popover-foreground` pair, per scheme and identity) or whether these components should reference an existing surface token (e.g. `background` / `foreground`). The components reference popover today, so the token set is the likelier gap.
- Once the popover surface has a real, opaque background, re-check the `muted-foreground` description contrast. If it still falls short of AA, adjust the `muted-foreground` value (the way spec 018 corrected the destructive Button pair) so the description passes against the popover background.
- Validate the corrected pair across the color-scheme/theme/density matrix, the way `themes-contrast.test.ts` guards the token-level pairs, so it holds in dark and the brand and vaporwave identities, not only the default.
- Remove the `color-contrast` quarantine from `OpenCloseInteraction` and `TooltipStacksAboveDialog` in `Dialog.stories.tsx` and confirm the a11y gate passes on its own merits.

## Why this is its own spec

Spec 020 was scoped to test configuration only and must not change tokens or components. Defining a token or shifting a color value is exactly that kind of change, and it needs its own contrast validation across the theme matrix. Spec 020 quarantined the single failing rule on the two affected stories (it disabled only `color-contrast`, so the interaction and other axe checks still run) and pointed the quarantine comments here.

## References

- Spec 020 — the test-runner layer-order fix; the quarantine lives in `packages/react/src/components/Dialog/Dialog.stories.tsx`.
- Spec 018 — the prior destructive-Button AA contrast fix; the model for correcting a token-driven contrast pair.
- The token source: `packages/tokens/src/tokens/` and the emitted `packages/tokens/dist/css/tokens-*.css`.
