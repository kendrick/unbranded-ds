# Spec 008 — Token schema growth

**Target version:** next minor bump after spec 005 (introduces required token additions, which is a breaking change to consumer themes)
**Depends on:** 003 (versioning workflow handles the multi-package bump and the breaking-change changelog entry cleanly)
**Blocks:** 010 (retrofit swaps primitive transitions to the DS motion tokens this spec introduces)
**Bundles for-coleman items:** B.1, B.2, B.3, C.2
**Also addresses:** the theme-override scope gap surfaced during spec 005's `/speckit.implement` (themes currently carry only `color`; Constitution Section III's "values float at runtime" applies to every category)
**Splits with:** spec 012 (`tmp/spec-012-theming-system-expansion.md`) — that spec picks up theme composition (multi-axis) and first-class theme-extension tokens, which need their own clarify cycle for the API design decisions involved. This spec stays narrowly: schema additions plus the small structural fix that lets themes override any category.

---

## Motivation

The for-coleman team needed a serif font, motion tokens for animation, and display-sized type — none of which the `@unbranded-ds/tokens@0.1.0` schema includes. They ended up adding the values themselves and treating the "extra tokens beyond the schema are allowed" line in THEMING.md as permission. That works, but it means every consumer reinvents the same handful of additions. Worse, components like `<Heading size="display-lg">` can't be standardized when the size names aren't in the schema.

This spec brings the missing categories into the canonical schema and documents the extension pattern for future additions.

---

## Context (theme overrides beyond color)

Surfaced during spec 005's `/speckit.implement`, when the new token-query MCP's `palette` tool was exercised against `'spacing'` and `'radius'` categories and returned `unknown-category`. The root cause: the bundled theme JSON files at `packages/tokens/themes/{light,dark,brand}.json` carry only `color` overrides. Every other category (`spacing`, `typography`, `radii`, `shadows`, `opacity`, and the `motion` category this spec adds) lives in the schema's default values and cannot be overridden per theme.

Constitution Section III states "token values float at runtime" without restricting which categories. Strict reading: a theme should be able to override any token, not just colors. Loose reading: themes are color skins and the rest is design-system-fixed. The current implementation matches the loose reading; the constitution implies the strict one.

Most consumers won't hit this — color shifts are 95% of theming. But for-coleman-style brand themes that want different rounding or different default spacing can't express that today. Fixing it in the same release as B.1/B.2/B.3 keeps the breaking-change announcement to one cycle.

The fix is structural, not new functionality:

- The Zod theme schema loosens to accept overrides for any category, not just `color`. Categories not present in a theme JSON inherit from the schema defaults.
- The validator merges theme overrides on top of schema defaults rather than treating non-color sections as either-present-or-error.
- A theme that overrides only some keys in a category is valid; missing keys inherit the schema default.
- THEMING.md grows a "Overriding non-color tokens" subsection alongside the existing schema-extension walkthrough.
- The token-query MCP's `palette` tool automatically starts returning useful results for `'spacing'`, `'radius'`, `'motion'`, etc. once theme JSON carries them — no MCP code change required.

Decision to make during this spec's implementation: do the built-in themes (`light.json`, `dark.json`, `brand.json`) gain default sections for non-color categories, or do they stay color-only and let consumers add their own? The brand theme is the strongest candidate to ship with non-color overrides (different border radius, accent font weight) since "brand" implies fuller customization.

---

## For-coleman context (B.1 — `font-serif`)

The schema declares `font-sans` and `font-mono` but not `font-serif`. Editorial, curatorial, museum, and book-style sites need serif body type. for-coleman added it via `--typography-font-serif` and treated the schema's passthrough behavior as permission.

The fix is a one-line schema addition. Note: because `themeSchema` requires every typography token, adding `font-serif` as a required key is a breaking change for any existing consumer theme. Pre-1.0 this is fine. Bump to 0.2.0 announces it.

---

## For-coleman context (B.2 — motion tokens)

The schema has zero motion tokens. Real apps need durations and easings. The for-coleman feedback proposed this exact set, sourced from Material Design and iOS HIG:

```
--duration-fast:     120ms
--duration-base:     240ms
--duration-slow:     480ms

--easing-standard:   cubic-bezier(0.4, 0, 0.2, 1)
--easing-decelerate: cubic-bezier(0, 0, 0.2, 1)
--easing-accelerate: cubic-bezier(0.4, 0, 1, 1)
```

These are conservative defaults. Adopt them as a new top-level `motion` token category alongside `color`, `spacing`, `typography`, `radius`, `shadow`, `opacity`.

---

## For-coleman context (B.3 — type scale beyond `xl`)

The schema currently stops at `size-xl` (1.25rem). Editorial sites need display sizes: `2xl`, `3xl`, `display-sm`, `display`, `display-lg`, `display-xl`. The triage decision was to add `2xl` and `3xl` as required additions, and defer the display sizes until a component contract (likely `<Heading>`) demands them. Naming display stops stylistically without a consumer is premature.

---

## For-coleman context (C.2 — schema extension worked example)

THEMING.md says "extra tokens beyond the schema are allowed; forward compatible by design." That's true but unhelpful without an example. A first-time consumer hits the question: "how do I add a new token type and have it flow through Style Dictionary into the dist outputs?"

This spec adds a worked example to THEMING.md that demonstrates the full pipeline using motion tokens (from B.2) as the working example. The example covers:

- Adding a new DTCG source file (`packages/tokens/src/tokens/motion.json`)
- Updating the Zod schema in [packages/tokens/src/schema.ts](packages/tokens/src/schema.ts)
- Updating each theme JSON file ([packages/tokens/themes/light.json](packages/tokens/themes/light.json), `dark.json`, `brand.json`) to include motion values
- Running `tsx sd.config.ts` to regenerate dist outputs
- Verifying the new tokens appear in `dist/tailwind/preset.css`, `dist/css/tokens-*.css`, and the typed token map at `dist/ts/token-map.js`

The example doubles as the implementation log for B.2 itself — if you wrote B.2, you generated the content for C.2 as a side effect.

---

## Scope

- Schema: add `font-serif` to the typography category as a required key
- Schema: add a new `motion` category with the six durations and easings from B.2
- Schema: add `size-2xl` and `size-3xl` to the typography category as required keys
- Schema: loosen theme JSON validation to accept overrides for any category, not just `color`. Theme JSON files may include any subset of categories; missing keys inherit from the schema defaults.
- All three built-in themes ([light.json](packages/tokens/themes/light.json), [dark.json](packages/tokens/themes/dark.json), [brand.json](packages/tokens/themes/brand.json)): add values for every newly required token
- Built-in theme decision (in scope): decide during clarify whether `brand.json` ships with non-color overrides (e.g., a different `radii` set, a different `typography.font-sans` value) to demonstrate the broader theming surface, or stays color-only with the override capability documented but not exercised
- Token sources under [packages/tokens/src/tokens/](packages/tokens/src/tokens/): add `motion.json`, update `typography.json` for font-serif and the larger sizes
- Style Dictionary build: confirm motion category flows through to all four artifacts (CSS variables, Tailwind preset, TypeScript token map, JSON)
- Validator: merge per-theme overrides on top of schema defaults so `validateTheme()` accepts partial category coverage in a theme file
- THEMING.md: add an "Extending the schema" section with the worked example AND an "Overriding non-color tokens" subsection that shows how a brand theme overrides spacing or radii
- Validation: `validateTheme()` reports a clear error for themes missing any of the new required tokens (and for the WCAG contrast pairs that still apply unchanged)
- Bump to 0.2.0

## Out of scope

- Display sizes (`display-sm`, `display`, `display-lg`, `display-xl`) — deferred until a component contract requires them
- Density / touch-target tokens (B.4 from the for-coleman feedback) — deferred indefinitely
- Adding values for the new tokens to existing consumer themes outside this repo — that's their migration cost (announced via the 0.2.0 bump)
- Theme composition (multi-axis themes like `data-theme="vaporwave compact"`) — deferred to spec 012
- First-class theme-extension tokens (TypeScript types + MCP visibility for tokens declared in a theme JSON but not in the schema) — deferred to spec 012

## Acceptance criteria

- The Zod schema in [packages/tokens/src/schema.ts](packages/tokens/src/schema.ts) declares `motion` as a top-level token category with six required keys; `typography` requires `font-serif`, `size-2xl`, `size-3xl` in addition to the existing keys.
- All three built-in themes pass `validateTheme()` against the new schema.
- The motion tokens appear as Tailwind utilities (`duration-fast`, `easing-standard`, etc.) via the generated [packages/tokens/dist/tailwind/preset.css](packages/tokens/dist/tailwind/preset.css).
- A consumer can write a new component using `transition-[duration-base] ease-[--easing-standard]` (or equivalent Tailwind syntax) and have it resolve correctly.
- A theme missing any required new token gets a structured validation error from `validateTheme()` naming the missing path.
- THEMING.md has a working "Extending the schema" walkthrough that another contributor can follow to add a new token category from scratch.
- A theme JSON file may include `spacing`, `radii`, `typography`, or any other category and the build accepts it. A consumer's brand theme that overrides only `color` and `radii` validates cleanly and produces a working CSS variable set.
- The token-query MCP's `palette` tool returns the resolved values for any category present in the active theme (no MCP code change in this spec; the unblock is automatic once the theme JSON carries the data).
- 0.2.0 published.

## Constitution check (bridge rules)

Section XI is not yet ratified. The prose rules apply informally:

- THEMING.md additions pass through the humanizer skill
- No three-item lists in the worked example or the section prose
- Validator error messages stay structured (`{ ok: false, issues: [{ code, path, message }] }`) — the existing pattern from Section III of the constitution

No components added → the sidecar `*.usage.md` rule doesn't bite this spec.

## References

- [TODO.md](TODO.md) sections B.1, B.2, B.3, C.2 — original for-coleman feedback
- [packages/tokens/src/schema.ts](packages/tokens/src/schema.ts) — current Zod schema, six categories
- [packages/tokens/themes/light.json](packages/tokens/themes/light.json) — example theme structure
- [packages/tokens/src/tokens/](packages/tokens/src/tokens/) — DTCG source files (color.json, spacing.json, etc.)
- [packages/tokens/sd.config.ts](packages/tokens/sd.config.ts) — Style Dictionary build configuration
- [packages/tokens/src/validate.ts](packages/tokens/src/validate.ts) — `validateTheme()` implementation
- [THEMING.md](THEMING.md) — currently lacks the extension walkthrough
