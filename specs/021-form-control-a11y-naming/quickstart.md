# Quickstart: verifying spec 021

How to confirm the feature is correct, end to end.

## 1. The docs no longer teach the broken pattern

```bash
# No bare native-label naming of Checkbox/Switch remains in the @example blocks or sidecars.
# Each corrected example shows aria-label or aria-labelledby.
rg -n 'aria-labelledby|aria-label' packages/react/src/components/{Checkbox,Switch,Slider}/*.usage.md
rg -n 'aria-labelledby|aria-label' packages/react/src/components/{Checkbox,Switch}/*.tsx
```

Expected: the labeled examples pair a visible `<Label id>` with `aria-labelledby`, and keep the wrapping `<label>` (Checkbox) or `<Label htmlFor>` (Switch) for click-to-toggle. Unlabeled examples use `aria-label`. The Slider basic `@example` names its thumb.

## 2. The Range story names both thumbs

```bash
rg -n 'aria-label' packages/react/src/components/Slider/Slider.stories.tsx
```

Expected: the Range story's two thumbs read `"Minimum"` and `"Maximum"`, not `"Value"`/`"Value"`.

## 3. The dev warning fires (and stays quiet) correctly

```bash
pnpm --filter @unbranded-ds/react test
```

The hook's unit test asserts the full matrix: unnamed → one `warn()` with `issue: 'missing-accessible-name'`; `aria-label` → none; `aria-labelledby` → none; `NODE_ENV=production` → none. Per-component tests assert each control wires the hook.

## 4. The a11y gate still passes

```bash
pnpm --filter @unbranded-ds/storybook test:storybook
```

Expected: green. The corrected examples and the renamed Range thumbs all expose accessible names; no axe `aria-toggle-field-name` / `label` violations across Checkbox, Switch, Slider.

## 5. The sidecar examples still compile

```bash
pnpm tsx scripts/validate-sidecars.ts
```

Expected: the rewritten `*.usage.md` `tsx` blocks compile under `tsc --noEmit` (spec 005's validator).

## 6. Production strips the warning

Build the package and confirm the `NODE_ENV === 'production'` branch dead-code-eliminates — no `missing-accessible-name` string in the prod bundle.

```bash
pnpm --filter @unbranded-ds/react build
rg -n 'missing-accessible-name' packages/react/dist || echo "absent in prod build — correct"
```

## 7. The changeset is present

```bash
ls .changeset/*.md   # one patch changeset for @unbranded-ds/react
```
