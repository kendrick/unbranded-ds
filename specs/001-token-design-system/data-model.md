# Data Model: Token-Driven Design System v0.1

**Branch**: `001-token-design-system` | **Date**: 2026-04-10

---

## Entities

### Design Token

A named value that forms the atomic visual vocabulary of the system.

**Attributes**:
- `name` (string): Dot-path identifier, e.g., `color.primary`, `spacing.4`, `radius.md`. Unique within the schema.
- `$value` (string): The token value in W3C DTCG format. Type depends on category (CSS color, CSS length, font stack, etc.).
- `$type` (string): DTCG type descriptor — `color`, `dimension`, `fontFamily`, `fontWeight`, `number`, `shadow`.
- `category` (string): One of the six token categories: `color`, `spacing`, `typography`, `radii`, `shadows`, `opacity`.
- `cssVariable` (string): The generated CSS custom property name, e.g., `--color-primary`. Derived from `name` by replacing dots with hyphens.
- `tailwindUtility` (string): The Tailwind utility class prefix this token maps to, e.g., `bg-primary`, `rounded-md`. Derived from category + name.

**Validation rules**:
- `name` must be unique across the schema.
- `$value` must be a valid CSS value for the declared `$type`.
- All six categories must have at least one token.
- Token names are fixed at build time (schema-locked).

**Relationships**:
- A Design Token belongs to exactly one category.
- A Design Token may be part of a contrast pair (see Contrast Pair below).
- Every Theme must provide a value for every Design Token in the schema.

---

### Theme

A complete set of token values packaged as a JSON document.

**Attributes**:
- `name` (string): Machine-readable identifier, e.g., `light`, `dark`, `brand`. Used as the `data-theme` attribute value.
- `displayName` (string): Human-readable label, e.g., `"Default Light"`, `"Acme Brand"`.
- `tokens` (object): Nested object mapping token dot-paths to CSS values. Must cover every token in the schema.

**Validation rules**:
- Every token in the schema must have a corresponding value in `tokens` (all required, per clarification).
- Each value must be a valid CSS value for the token's declared type.
- All declared foreground/background contrast pairs must meet WCAG AA (4.5:1 normal text, 3:1 large text).
- Extra tokens not in the schema are accepted (forward-compatible) but may trigger a warning.

**Relationships**:
- A Theme provides values for all Design Tokens.
- A Theme may inherit from one base theme (the on-disk file can be partial; the merged result must be schema-complete).
- Themes are independent of each other — no inheritance chains beyond one level.

**Lifecycle**:
- Authored as JSON file.
- Validated via `validateTheme()` (schema + contrast).
- Registered at runtime via `registerTheme()` (injects `<style>` block).
- Activated by setting `data-theme` attribute on a DOM element.
- Can coexist with other themes via nested `data-theme` scopes.

---

### Contrast Pair

A declared relationship between two tokens used as foreground and background, subject to WCAG AA contrast checking.

**Attributes**:
- `foreground` (string): Token dot-path of the foreground color, e.g., `color.primary-foreground`.
- `background` (string): Token dot-path of the background color, e.g., `color.primary`.
- `threshold` (number): WCAG contrast ratio threshold — 4.5 for normal text, 3.0 for large text.

**Validation rules**:
- Both `foreground` and `background` must reference tokens in the `color` category.
- The actual contrast ratio of the pair's values in a given theme must meet or exceed the `threshold`.

**Relationships**:
- A Contrast Pair references exactly two Design Tokens.
- Contrast Pairs are declared in the token schema metadata (not in individual themes).
- Every theme is validated against all declared Contrast Pairs.

---

### Component

A reusable UI element in the component library.

**Attributes**:
- `name` (string): PascalCase identifier, one of: `Button`, `Input`, `Label`, `Card`, `Dialog`, `Select`, `Checkbox`, `Switch`, `Tabs`.
- `primitiveSource` (string): Either `html` (Button, Input, Label, Card) or `base-ui` (Dialog, Select, Checkbox, Switch, Tabs).
- `variants` (array): List of variant axes defined via `class-variance-authority`, e.g., `size`, `variant`/`intent`.
- `props` (object): Component props including `className` (always present), variant props, and primitive-forwarded props.

**Validation rules**:
- Must style exclusively through token-derived Tailwind utilities. No hardcoded color/spacing/radius/shadow values.
- Must accept and merge `className` prop via `cn()`.
- Must have a co-located `.stories.tsx` and `.test.tsx` file.

**Relationships**:
- A Component consumes Design Tokens indirectly via Tailwind utility classes.
- A Component has one or more Stories.
- Components using Base UI primitives have a peer dependency on `@base-ui-components/react`.

---

### Story

An interactive, documented example of a component in a specific state.

**Attributes**:
- `name` (string): Story identifier, e.g., `Default`, `Large`, `Disabled`, `WithIcon`.
- `component` (string): The parent Component's name.
- `args` (object): Story arguments matching the component's props.
- `argTypes` (object): Metadata describing each arg (type, options, description) for autodocs and MCP.
- `playFunction` (function | null): Optional interaction test function. At least one story per component must have one.
- `tags` (array): Storybook tags, always includes `autodocs`.

**Relationships**:
- A Story belongs to exactly one Component.
- Stories are the contract surface for documentation, testing, and MCP introspection.

---

## Token Categories (v0.1 Schema)

| Category | Namespace | Example Tokens | Tailwind Utilities |
|----------|-----------|----------------|-------------------|
| Color | `color.*` | `color.background`, `color.foreground`, `color.primary`, `color.primary-foreground`, `color.muted`, `color.muted-foreground`, `color.border`, `color.ring`, `color.destructive`, `color.destructive-foreground` | `bg-*`, `text-*`, `border-*`, `ring-*` |
| Spacing | `spacing.*` | `spacing.1` through `spacing.16`, `spacing.px` | `p-*`, `m-*`, `gap-*`, `w-*`, `h-*` |
| Typography | `typography.*` | `typography.font-sans`, `typography.font-mono`, `typography.size-sm`, `typography.size-base`, `typography.size-lg`, `typography.weight-normal`, `typography.weight-medium`, `typography.weight-bold`, `typography.leading-normal`, `typography.leading-tight` | `font-*`, `text-*`, `font-weight-*`, `leading-*` |
| Radii | `radius.*` | `radius.sm`, `radius.md`, `radius.lg`, `radius.full` | `rounded-*` |
| Shadows | `shadow.*` | `shadow.sm`, `shadow.md`, `shadow.lg` | `shadow-*` |
| Opacity | `opacity.*` | `opacity.disabled`, `opacity.hover` | `opacity-*` |

---

## Declared Contrast Pairs

| Foreground Token | Background Token | Threshold |
|-----------------|-----------------|-----------|
| `color.foreground` | `color.background` | 4.5:1 |
| `color.primary-foreground` | `color.primary` | 4.5:1 |
| `color.muted-foreground` | `color.muted` | 4.5:1 |
| `color.destructive-foreground` | `color.destructive` | 4.5:1 |
