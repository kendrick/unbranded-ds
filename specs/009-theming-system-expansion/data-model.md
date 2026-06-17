# Data Model: Theming system expansion

**Phase 1 output** | **Date**: 2026-06-11

No persisted data. The "model" is the set of token/theme entities and the resolution flow that ties them together.

## Entities

### Theme axis

A named dimension of theming. Fixed set for this spec.

| Axis        | Attribute      | Source dir          | Precedence      |
| ----------- | -------------- | ------------------- | --------------- |
| `aesthetic` | `data-theme`   | `themes/aesthetic/` | base            |
| `density`   | `data-density` | `themes/density/`   | wins collisions |

A consumer activates at most one theme per axis. The axis → attribute map and the per-axis theme list come from `src/axes.ts` (`listThemesByAxis()`), the single source the build, MCP, and runtime read.

### Theme (DTCG source)

A file under `themes/<axis>/<name>.json`, pure DTCG (`{ category: { key: { $value, $type } } }`). Identity is the filename. No in-file axis metadata (the directory carries it). Shipped: `aesthetic/{light,dark,brand,vaporwave}.json`, `density/compact.json`.

### Resolved tokens (flat)

The flat `Record<category, Record<key, string>>` shape (`ResolvedTokens`) that `resolveTheme` produces and the runtime injects. One axis resolves to a complete `ResolvedTokens` via `resolveTheme(partial)` over `canonicalDefaultTokens`.

### Composed theme

The result of `composeTokens([aesthetic, density])` — a fold of complete `ResolvedTokens` layers, later layer (density) winning per key. Independent of authoring shape. This is what the runtime injects, what `validateTheme` validates, and what the MCP queries — the same value across all three.

### Theme-extension token

A token a theme declares that the schema does not (e.g. `shadows.neon`). Properties:

- Resolves to a CSS variable via the build passthrough (`--shadow-neon`).
- Typed in the token map **when from a bundled theme**, with `source: 'theme-extension'`.
- Visible at runtime through the MCP for **any** theme that carries it, labeled `source: 'theme-extension'`.
- Theme-scoped: not part of the locked schema; not guaranteed present in themes that don't declare it.

### Token-map entry (additive shape)

```
TokenDefinition {
  name: string;          // dot-path, e.g. "color.primary" | "shadows.neon"
  category: TokenCategory;
  type: string;          // DTCG $type
  cssVariable: string;   // "--color-primary" | "--shadow-neon" (motion-aware naming reused)
  source?: 'schema' | 'theme-extension';   // NEW, optional (additive); always emitted as a value
}
```

`source` is optional in the type so existing entries and consumer imports keep compiling; the generator always writes a concrete value.

## Resolution flow (the one path everything shares)

```
per axis:   DTCG theme ──dtcgToResolved──▶ partial ──resolveTheme──▶ ResolvedTokens (complete)
compose:    composeTokens([aesthetic, density])  // density last, wins per key
            │
            ├─ runtime:   inject as CSS vars; cascade mirror = @layer ds-aesthetic < ds-density
            ├─ validate:  completeness + WCAG contrast on the COMPOSED pairs
            └─ MCP:       lookupToken / palette / contrast read off the composed result
```

`mergeLayer(base, override)` is the single per-key merge; `resolveTheme` = `mergeLayer(defaults-seed, partial)`, `composeTokens` = left fold of `mergeLayer`.

## Validation rules

- **Invalid axis combination** (two themes assigned to one axis) → structured error `{ code, path, axes }`. This is the only collision case that errors.
- **Ordinary cross-axis value collision** → resolves silently, density wins. Not an error.
- **Contrast on the composed result** → a density value that breaks an aesthetic's AA foreground/background pair fails loudly (the existing contrast gate, now over the composed set).
- **Unrecognized axis attribute** → ignored; the other axes still apply.
- **Extension token** → validates (the schema `.passthrough()` tolerates it); emits as a CSS var; gets `source: 'theme-extension'` in the map/MCP.

## Invariants after the change

- The value the MCP returns for a token under a given axis pair equals the value the runtime paints and the value the validator validated.
- `density` always wins a collision, in the resolver, the emitted CSS `@layer` order, and the browser.
- Single-axis `data-theme` (pre-009) resolves byte-identically to before.
- Existing `TokenDefinition` consumers compile unchanged (`source` is optional).
- The tokens package keeps zero React/Storybook dependencies.
