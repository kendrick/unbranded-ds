# Contract: validateTheme / registerTheme (resolve-then-validate)

The runtime-theme validation API after this spec. Applies to the **runtime theme document** format only (the flat `{ name, displayName, tokens }` shape). Built-in DTCG token-source overrides are not inputs here.

## validateTheme

```ts
function validateTheme(themeJson: unknown): ValidationResult
```

**Behavior change**: accept a *partial* theme (any subset of categories/keys), resolve it against the canonical defaults, and validate the merged result.

```
1. parse: Zod schema accepts a partial theme (categories/keys optional).
   On shape errors → { ok: false, issues: [INVALID_TYPE | MISSING_TOKEN ...] }
2. resolve: resolved = deepMerge(canonicalDefaults, theme.tokens)   // override wins
3. completeness: every required token present in `resolved`?
   else → MISSING_TOKEN(path)   // only fires if the DEFAULTS are incomplete
4. contrast: for each contrast pair, read BOTH sides from `resolved`.
   Never skip a pair because one side was absent from the override.
   ratio < threshold → CONTRAST_FAILURE(pair, ratio, threshold)
5. → { ok: true, theme: resolved } | { ok: false, issues }
```

**Result shape (unchanged):**

```ts
type ValidationResult =
  | { ok: true; theme: Theme }
  | { ok: false; issues: ValidationIssue[] }

interface ValidationIssue {
  path: string
  code: 'MISSING_TOKEN' | 'INVALID_TYPE' | 'UNKNOWN_TOKEN' | 'CONTRAST_FAILURE'
  message: string
  expected?: string; actual?: string; ratio?: number; threshold?: number
}
```

## registerTheme

```ts
function registerTheme(themeJson: Theme): void   // throws ThemeValidationError
```

Same resolve-then-validate, applied before BOTH:
- the `validateTheme` call (already there), and
- the post-oklch-conversion contrast pass (`runtime.ts:97`), which currently skips a pair when one converted side is absent. It MUST instead resolve the converted colors against the resolved defaults and check the full pair set.

Then it injects `<style>[data-theme="<name>"]{ ... }`. Injection is unchanged.

## Behavioral contract (acceptance)

| Input | Expected |
| --- | --- |
| Full valid runtime theme | `{ ok: true }` (unchanged from today) |
| Partial theme: only `color` + `radius` | `{ ok: true }`; omitted categories inherit defaults; resolved theme is complete |
| Partial theme: overrides `color.background`, inherits `color.foreground` | contrast checked against inherited foreground + overridden background; fails AA → `CONTRAST_FAILURE` (NOT skipped) |
| Color-only theme (prior format) | `{ ok: true }` — no regression |
| Theme + defaults both missing a required token | `MISSING_TOKEN(path)` (guards default completeness) |
| Override with a malformed value | `INVALID_TYPE(path)` |

## Non-goals

- The DTCG build-source format is not validated here.
- The MCP `palette` tool needs no change; it resolves from the token map once theme data carries the category.
- Theme composition (multi-axis) and derived tokens are out of scope (specs 009 and the roadmap).
