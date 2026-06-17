# Spec 020 — Make the z-index stacking test run in the Storybook test-runner

**Target version:** no package version change (test-env + test config only)
**Depends on:** spec-019 (the Storybook test-runner gate); the quarantined story lives there
**Blocks:** full interaction coverage of the nested-overlay stacking guarantee (spec 010)
**Status:** brief (not yet specified)

> Captured on 2026-06-16 while landing spec 019. The Dialog story "Tooltip stacks above dialog" had to be quarantined (`tags: ['!test']`) because its z-index assertion can't run in the browser test-runner. Recorded so the gap is a tracked follow-up, not a silent hole.

## The problem

The Dialog story `TooltipStacksAboveDialog` is the spec-010 regression test: a tooltip opened inside an open dialog must stack above it, because the tooltip reads `--z-index-tooltip` (60) and the dialog reads `--z-index-overlay` (50). The play asserts this by reading `getComputedStyle(el).zIndex` on each content element.

In the Vitest browser-mode runner (spec 019), both reads come back `auto`, so `Number.parseInt` gives `NaN` and `expect(NaN).toBeGreaterThan(NaN)` fails. The story renders correctly in the full Storybook dev/build — the stacking works in production — but the automated assertion never actually executed before the runner existed, and it doesn't run now.

The root cause is how the tokens load. Color tokens resolve in the test because the preview imports the theme CSS files directly (`@unbranded-ds/tokens/themes/*.css`), which carry the `--color-*` custom properties as plain CSS. The z-index tokens come from the preset's Tailwind v4 `@theme` block (via `styles.css` → `@unbranded-ds/react/preset.css`), and the components reference them with the arbitrary `z-(--z-index-tooltip)` syntax. In the runner's vite pass, `--z-index-tooltip` and `--z-index-overlay` are not surfaced to the cascade, so the `z-index: var(...)` declarations fall back to `auto`.

## The fix (to investigate)

Some option that makes the z-index custom properties resolve in the test environment without changing the tokens or the component:

- Confirm whether Tailwind v4 `@theme` is tree-shaking the `--z-index-*` vars in the runner's content scan, and if so, ensure the component glob (`packages/react/src/**`) is scanned so the `z-(--z-index-*)` usages are detected.
- Or load the z-index custom properties as plain CSS in the test setup, the way the theme color CSS already loads, so `getComputedStyle` resolves them.
- Then remove `tags: ['!test']` from `TooltipStacksAboveDialog` and confirm the assertion passes in the runner.

## Scope guardrails

- Test-environment and test-config only. Do not change the z-index tokens, the Dialog/Tooltip components, or the stacking behavior — those are correct.
- The goal is to re-enable one quarantined assertion, not to re-architect how Storybook loads tokens.

## References

- Spec 019 — the test-runner gate; the quarantine tag and comment live in `Dialog.stories.tsx`.
- Spec 010 — the nested-overlay stacking fix this test guards.
