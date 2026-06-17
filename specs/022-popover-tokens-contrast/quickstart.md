# Quickstart: verifying spec 022

How to confirm the feature is correct, end to end.

## 1. The schema and contrast pairs grew

```bash
# colorTokens declares the pair; contrastPairs has the two popover entries.
rg -n "popover" packages/tokens/src/schema.ts
```

Expected: `popover` and `popover-foreground` in `colorTokens`, and `popover-foreground`/`popover` plus `muted-foreground`/`popover` in `contrastPairs`.

## 2. Every cell authors the pair from its own background

```bash
rg -n '"popover"|"popover-foreground"' \
  packages/tokens/src/tokens/color.json \
  packages/tokens/themes/color-scheme/dark.json \
  packages/tokens/themes/theme/brand/light.json \
  packages/tokens/themes/theme/brand/dark.json \
  packages/tokens/themes/theme/vaporwave/light.json \
  packages/tokens/themes/theme/vaporwave/dark.json
```

Expected: all six files declare both, each value matching that file's `background` / `foreground`.

## 3. The build regenerates artifacts and emits the variable

```bash
pnpm --filter @unbranded-ds/tokens build
rg -n "color-popover" packages/tokens/dist/tailwind/preset.css
rg -n "popover" packages/tokens/src/defaults.generated.ts
```

Expected: `--color-popover` and `--color-popover-foreground` in the preset; the regenerated defaults baseline carries the pair. (`defaults.generated.ts` is build-written, never hand-edited.)

## 4. The token suite passes, matrix included

```bash
pnpm --filter @unbranded-ds/tokens test
```

Expected: `schema.test.ts` passes with `contrastPairs` length 8; `themes-contrast.test.ts` passes all six cells against the two new popover pairs; `defaults.test.ts` matches the regenerated baseline.

## 5. The a11y gate passes with the quarantine gone

```bash
rg -n "color-contrast" packages/react/src/components/Dialog/Dialog.stories.tsx || echo "quarantine removed — correct"
pnpm --filter @unbranded-ds/storybook test:storybook
```

Expected: no `color-contrast` suppression remains on `OpenCloseInteraction` or `TooltipStacksAboveDialog`; the gate is green, with no `color-contrast` violation on any Dialog, Tooltip, or Select story.

## 6. The components still render unchanged in structure

```bash
pnpm --filter @unbranded-ds/react test
```

Expected: green. No component source changed; the Dialog/Tooltip/Select surfaces are now opaque via the token, not via markup.

## 7. The changeset is present

```bash
ls .changeset/*.md   # tokens minor, react patch
```
