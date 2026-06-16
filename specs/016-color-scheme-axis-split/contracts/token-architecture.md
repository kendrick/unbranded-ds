# Contract: token architecture

How the per-combination palettes are organized, emitted, and composed.

## Directory layout (the build derives axis and combination from the path)

```text
packages/tokens/
├── src/tokens/                      # the base token set = default identity, light scheme
└── themes/
    ├── color-scheme/
    │   └── dark.json                # default-dark (light is the file-less base)
    ├── theme/
    │   ├── brand/
    │   │   ├── light.json
    │   │   └── dark.json
    │   └── vaporwave/
    │       ├── light.json            # newly designed
    │       └── dark.json             # today's vaporwave palette
    └── density/
        └── compact.json              # unchanged (comfortable is file-less)
```

## Emission (`sd.config.ts`)

- Color-scheme themes source the full base and emit a complete var set under `[data-color-scheme="<name>"]` in `@layer ds-color-scheme`.
- Theme (identity) palettes source the full base and emit a complete var set under the compound selector `[data-theme="<identity>"][data-color-scheme="<scheme>"]` in `@layer ds-theme`.
- Density stays the existing delta path under `[data-density="<name>"]` in `@layer ds-density`.
- `layer-order.css` becomes `@layer ds-color-scheme, ds-theme, ds-density;` (update the generated line and the explaining comment).

## Composition rules

- An identity palette (compound selector, `ds-theme`) wins over the bare color-scheme base (`ds-color-scheme`) because `ds-theme` is the later layer; density (`ds-density`) wins over both. Layers beat specificity, as today, so the result is deterministic regardless of import order.
- `default` identity has no theme file; the color-scheme base shows through.
- The resolver (`composeTokens`) mirrors the CSS by construction: callers compose `[colorScheme, theme, density]` in that order, later wins per key.

## Validation

Every shipped cell of the matrix (six palettes) is validated for completeness and WCAG AA, including the new `muted-foreground`/`background` pair. A failing cell fails the build, not ships.
