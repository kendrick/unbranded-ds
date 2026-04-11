# Contract: @unbranded-ds/tokens Public API

**Package**: `@unbranded-ds/tokens`  
**Date**: 2026-04-10

---

## Exports

### `validateTheme(themeJson: unknown): ValidationResult`

Validates a theme JSON document against the token schema and WCAG AA contrast requirements.

**Input**: Any JSON value (parsed theme file).

**Output**:
```typescript
type ValidationResult =
  | { ok: true; theme: Theme }
  | { ok: false; issues: ValidationIssue[] };

type ValidationIssue = {
  path: string;       // Dot-path to the failing token, e.g., "color.primary"
  code: 'MISSING_TOKEN' | 'INVALID_TYPE' | 'UNKNOWN_TOKEN' | 'CONTRAST_FAILURE';
  message: string;    // Human-readable error description
  expected?: string;  // Expected type or value
  actual?: string;    // Actual type or value
  ratio?: number;     // Actual contrast ratio (for CONTRAST_FAILURE)
  threshold?: number; // Required contrast ratio (for CONTRAST_FAILURE)
};
```

**Behavior**:
- Checks schema conformance: every required token present, values well-typed.
- Checks WCAG AA contrast for all declared foreground/background pairs.
- Returns `{ ok: true, theme }` with the validated theme object on success.
- Returns `{ ok: false, issues }` with all issues on failure (does not short-circuit).
- Unknown tokens are accepted (forward-compatible) but may appear as `UNKNOWN_TOKEN` warnings in issues (with `ok: true`).

---

### `themeSchema: ZodType<Theme>`

Zod schema for theme JSON files. Usable for standalone validation or integration with form libraries.

---

### `tokenMap: Record<string, TokenDefinition>`

Typed map of all tokens in the schema. Each entry includes the token's name, category, type, and CSS variable name.

```typescript
type TokenDefinition = {
  name: string;         // Dot-path, e.g., "color.primary"
  category: 'color' | 'spacing' | 'typography' | 'radii' | 'shadows' | 'opacity';
  type: string;         // DTCG $type value
  cssVariable: string;  // e.g., "--color-primary"
};
```

---

### `registerTheme(themeJson: Theme): void`

Validates the theme (throws on failure) and injects a `<style>` block scoped to `[data-theme="<name>"]`.

**Throws**: `ThemeValidationError` if theme fails validation.

---

### `contrastPairs: ContrastPair[]`

Array of declared foreground/background pairs for contrast checking.

```typescript
type ContrastPair = {
  foreground: string;  // Token dot-path
  background: string;  // Token dot-path
  threshold: number;   // WCAG AA ratio
};
```

---

## Build Artifacts (dist/)

| Artifact | Path | Description |
|----------|------|-------------|
| CSS variables | `dist/css/tokens-{theme}.css` | One file per built-in theme, scoped under `[data-theme="<name>"]` |
| Tailwind preset | `dist/tailwind/preset.css` | `@theme inline` block mapping token namespaces to CSS variables |
| TypeScript | `dist/ts/tokens.ts` + `dist/ts/tokens.d.ts` | Typed token map and type declarations |
| JSON | `dist/json/tokens.json` | Raw token data for downstream consumers |

---

## Peer Dependencies

None. This package is standalone.

## Dependencies

- `zod` (schema validation)
- `style-dictionary` (build-time only, devDependency)
- A color contrast calculation library (e.g., `wcag-contrast` or built-in)
