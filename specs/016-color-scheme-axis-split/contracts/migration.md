# Contract: the in-repo cutover

There are no external consumers, so this is a clean break with no public codemod or deprecation shim. Everything below moves in the same change so `main` is never on the old model.

## Example app (`examples/nextjs-15-app-router/`)

- `app/globals.css`: the override block selector `[data-theme='light'], [data-theme='dark']` becomes `[data-color-scheme='light'], [data-color-scheme='dark']`; the theme CSS imports update to the new emitted files.
- `app/components/pinned-vaporwave.tsx`: the hardcoded `data-theme="vaporwave" data-density="compact"` becomes `data-theme="vaporwave" data-color-scheme="dark" data-density="compact"`, and `forced={{ aesthetic: 'vaporwave', density: 'compact' }}` becomes `forced={{ theme: 'vaporwave', colorScheme: 'dark', density: 'compact' }}`.
- `app/components/header.tsx`: add the new identity `ThemeToggle` next to `ColorSchemeToggle` (the renamed control) and `DensityToggle`.
- `tests/theming.spec.ts`, `tests/composition.spec.ts`: assertions on `html` for light/dark move to `data-color-scheme`; identity assertions use `data-theme`.

## Storybook (`apps/storybook/.storybook/`)

- `preview.ts`: split the single conflated toolbar global into a color-scheme global and a theme global, each writing its attribute and its storage key.
- `preview-head.html`: fix the stale bootstrap (it reads `ds-theme`, the wrong key, and sets only `data-theme`); replace it with the three-axis bootstrap.

## Package stories and tests (`packages/react/src/`)

- `_theming/Composition.stories.tsx`: set all three attributes.
- The toggle stories and tests, the `useTheme` and `themeStore` tests, the `forced` test: update axis keys (`aesthetic` to `theme`), the new `colorScheme` axis, and the renamed control.

## Tokens self-references (`packages/tokens/src/`)

- `mcp/compose.ts`, `mcp/tools/listThemes.ts`: thread the third axis.
- `runtime.test.ts`, `axes.test.ts`: update the axis/attribute expectations.

## Governance

- Amend Constitution Section III (three-axis model, new layer order, color-scheme wording); MINOR bump with a SYNC IMPACT REPORT.
- Add a `.changeset/*.md`: `@unbranded-ds/tokens` minor and `@unbranded-ds/react` minor.
