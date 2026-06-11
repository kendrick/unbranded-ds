# Theming

Themes are just CSS variables scoped to a `[data-theme]` selector. Every component reads its colors, spacing, radii, etc. from these variables through Tailwind utilities. Swap the attribute, swap the look. No component code changes.

Three themes come built in: light, dark, and brand.

## Two things called "theme"

"Theme" means two different things here, on two different pipelines. Knowing which one you are holding saves confusion.

A **token-source override** is a build-time file under `packages/tokens/themes/`, authored in DTCG format (`$value` / `$type`). Style Dictionary merges it over the default token sources and bakes a static `[data-theme="<name>"]` CSS file. The built-in `light`, `dark`, and `brand` themes are this kind. You ship them in the package; consumers load the generated CSS.

```jsonc
// packages/tokens/themes/sunset.json: a token-source override (DTCG)
{
  "color": { "primary": { "$value": "oklch(0.65 0.2 35)", "$type": "color" } },
  "radius": { "md": { "$value": "0.75rem", "$type": "dimension" } }
}
```

A **runtime theme document** is a flat object passed to `registerTheme()` or `validateTheme()` at runtime. It carries `name`, `displayName`, and a `tokens` map of plain string values. The validator checks it and injects a `<style>` block on the fly. This is what a consumer builds dynamically in the browser.

```jsonc
// a runtime theme document (flat values, passed to registerTheme)
{
  "name": "sunset",
  "displayName": "Sunset",
  "tokens": {
    "color": { "primary": "oklch(0.65 0.2 35)" },
    "radius": { "md": "0.75rem" }
  }
}
```

The build consumes the first; `registerTheme` and `validateTheme` consume the second. They are not interchangeable: a DTCG source file will not pass `validateTheme`, and a runtime document is not a Style Dictionary source. Most of this doc covers the runtime document (the "Writing a custom theme" path just below). The "Extending the schema" section near the end covers the build-time token sources.

## Writing a custom theme

A runtime theme is a JSON object. You can supply a full token set, or only the parts you want to change: any token you omit inherits the default value. The example below is a complete theme; a partial one (say, only `color` and `radius`) is equally valid.

```json
{
	"name": "my-theme",
	"displayName": "My Custom Theme",
	"tokens": {
		"color": {
			"background": "#f8f9fa",
			"foreground": "#212529",
			"primary": "#0d6efd",
			"primary-foreground": "#ffffff",
			"muted": "#e9ecef",
			"muted-foreground": "#495057",
			"border": "#dee2e6",
			"ring": "#0d6efd",
			"destructive": "#dc3545",
			"destructive-foreground": "#ffffff"
		},
		"spacing": {
			"px": "1px",
			"1": "0.25rem",
			"2": "0.5rem",
			"3": "0.75rem",
			"4": "1rem",
			"5": "1.25rem",
			"6": "1.5rem",
			"7": "1.75rem",
			"8": "2rem",
			"9": "2.25rem",
			"10": "2.5rem",
			"11": "2.75rem",
			"12": "3rem",
			"13": "3.25rem",
			"14": "3.5rem",
			"15": "3.75rem",
			"16": "4rem"
		},
		"typography": {
			"font-sans": "system-ui, sans-serif",
			"font-mono": "monospace",
			"size-sm": "0.875rem",
			"size-base": "1rem",
			"size-lg": "1.125rem",
			"size-xl": "1.25rem",
			"weight-normal": "400",
			"weight-medium": "500",
			"weight-semibold": "600",
			"weight-bold": "700",
			"leading-normal": "1.5",
			"leading-tight": "1.25",
			"leading-relaxed": "1.625"
		},
		"radius": { "sm": "0.25rem", "md": "0.375rem", "lg": "0.5rem", "full": "9999px" },
		"shadow": {
			"sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
			"md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
			"lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
		},
		"opacity": { "disabled": "0.5", "hover": "0.8" }
	}
}
```

Colors work in hex (`#0d6efd`) or oklch (`oklch(0.54 0.25 264)`). Hex gets converted to oklch when the theme is registered at runtime.

If you add tokens that aren't in the schema, that's ok: they'll be ignored but won't cause errors. Forward compatible by design.

## Validating

It's a good idea to run your theme through `validateTheme()` before using it:

```typescript
import { validateTheme } from '@unbranded-ds/tokens';
import myTheme from './my-theme.json';

const result = validateTheme(myTheme);

if (result.ok) {
	console.log('Theme is valid!');
}
else {
	for (const issue of result.issues) {
		console.error(`${issue.code}: ${issue.message} (at ${issue.path})`);
	}
}
```

It resolves your theme against the defaults first, so a partial theme is checked as its complete merged result, then verifies two things: every required token has a value of the right type, and the foreground/background color pairs meet WCAG AA contrast (4.5:1). Because the check runs on the merged result, a pair where you override one side and inherit the other is still validated against the real resolved colors.

### Contrast pairs

These get checked automatically:

| Foreground                     | Background          | Threshold |
| ------------------------------ | ------------------- | --------- |
| `color.foreground`             | `color.background`  | 4.5:1     |
| `color.primary-foreground`     | `color.primary`     | 4.5:1     |
| `color.muted-foreground`       | `color.muted`       | 4.5:1     |
| `color.destructive-foreground` | `color.destructive` | 4.5:1     |

## Applying at runtime

`registerTheme()` validates your theme and injects a `<style>` block scoped to `[data-theme="my-theme"]`. If validation fails, it throws a `ThemeValidationError`.

```typescript
import { registerTheme } from '@unbranded-ds/tokens/runtime';
import myTheme from './my-theme.json';

registerTheme(myTheme);
```

Then set the attribute to activate it:

```html
<html data-theme="my-theme"></html>
```

Or flip it in JS:

```javascript
document.documentElement.setAttribute('data-theme', 'my-theme');
```

## FOUC prevention: choosing your approach

Theme-aware apps need to apply the saved theme before first paint. Two viable design paths exist; pick the one that matches your stack.

### Path 1: inline bootstrap script (recommended for most consumers)

The canonical pattern: inline a tiny script in `<head>` that reads `localStorage` and sets `data-theme` synchronously before the body renders. `@unbranded-ds/tokens/runtime` exports this as a string so you do not need to copy-paste it.

```tsx
import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime';

export default function RootLayout({ children }) {
	return (
		<html>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
			</head>
			<body>{children}</body>
		</html>
	);
}
```

Works in client-rendered SPAs and SSR apps alike. For a non-light default theme:

```tsx
import { getThemeBootstrapScript } from '@unbranded-ds/tokens/runtime';

const bootstrap = getThemeBootstrapScript({ defaultTheme: 'dark' });
```

Under a strict Content Security Policy that forbids `script-src 'unsafe-inline'`, attach a `nonce` to the `<script>` element to match the per-request CSP nonce, or compute the SHA hash of the bootstrap output and add it to your CSP allowlist. The factory's output is deterministic — compute the hash once at build time and trust it.

### Path 2: cookie + server-rendered `data-theme` (roadmap)

A CSP-clean alternative for SSR apps: persist theme preference in a cookie (server can read it), and have the framework emit `<html data-theme="dark">` directly on every request. No client-side script runs before first paint.

This approach is **roadmap territory** — not yet shipped. The trade-offs are documented in [specs/002-consumer-dx-preset/spec.md](specs/002-consumer-dx-preset/spec.md) but the implementation needs its own spec covering server-side helpers, cookie attributes, framework recipes, and sync semantics between cookie and localStorage. For SSR consumers who want zero inline scripts, this is the long-term direction; expect it before the 0.3.0 release.

### `prefers-color-scheme` complement

CSS-only: respond to the OS-level color scheme via `@media (prefers-color-scheme: dark)`. Useful as a complement (catches users who never explicitly set a preference), not as a replacement (does not honor user override, does not support custom themes beyond light/dark).

## Using the built-in themes

Import the CSS for whichever themes you need:

```typescript
import '@unbranded-ds/tokens/dist/css/tokens-light.css';
import '@unbranded-ds/tokens/dist/css/tokens-dark.css';
import '@unbranded-ds/tokens/dist/css/tokens-brand.css';
```

Or as link tags:

```html
<link rel="stylesheet" href="@unbranded-ds/tokens/dist/css/tokens-light.css" />
<link rel="stylesheet" href="@unbranded-ds/tokens/dist/css/tokens-dark.css" />
<link rel="stylesheet" href="@unbranded-ds/tokens/dist/css/tokens-brand.css" />
```

Switch between them by changing `data-theme`. No reload needed.

## Overriding non-color tokens

Themes are not limited to color. A theme of either kind can override any category: radius, spacing, typography, shadow, motion, and the rest. Anything you do not mention inherits the default.

The built-in `brand` theme shows this. On top of its color palette it rounds the corners and swaps the sans-serif face, leaving everything else at the defaults:

```jsonc
// packages/tokens/themes/brand.json (excerpt)
{
  "color": { "...": "..." },
  "radius": {
    "sm": { "$value": "0.375rem", "$type": "dimension" },
    "md": { "$value": "0.5rem", "$type": "dimension" },
    "lg": { "$value": "0.75rem", "$type": "dimension" }
  },
  "typography": {
    "font-sans": { "$value": "\"Inter\", ui-sans-serif, system-ui, sans-serif", "$type": "fontFamily" }
  }
}
```

It overrides three of the four radius stops and one typography token. `radius.full` and every other typography value (including `size-2xl`) go unmentioned, so they inherit. The resolved `tokens-brand.css` carries the rounded radii and the Inter stack next to the inherited defaults.

A runtime theme document does the same with flat values:

```jsonc
{
  "name": "rounded",
  "displayName": "Rounded",
  "tokens": { "radius": { "md": "0.75rem", "lg": "1rem" } }
}
```

`validateTheme` resolves this against the defaults before checking, so the omitted categories are present in the validated result.

## Extending the schema

When a token you need does not exist in the schema, you add it to the canonical set so every consumer gets it. The pipeline below uses the `motion` category as the worked example.

1. **Add a DTCG source file** under `packages/tokens/src/tokens/`. Motion lives in `motion.json`:

```jsonc
{
  "motion": {
    "duration": {
      "fast": { "$value": "120ms", "$type": "duration" },
      "base": { "$value": "240ms", "$type": "duration" }
    },
    "easing": {
      "standard": { "$value": "cubic-bezier(0.4, 0, 0.2, 1)", "$type": "cubicBezier" }
    }
  }
}
```

2. **Add the category to the Zod schema** in `packages/tokens/src/schema.ts` so themes can carry it and the validator knows it. Make it required when every theme must supply a value, optional when it should inherit a default if omitted.

3. **Add the values to the canonical defaults** in `packages/tokens/src/defaults.ts` (the inheritance baseline), plus any theme that overrides them. A drift-guard test keeps the defaults honest against the sources.

4. **Wire the build naming** in `packages/tokens/sd.config.ts` when the category needs CSS-variable names that differ from the default `--<category>-<key>` pattern. Motion is the one special case: it emits `--duration-*` and `--ease-*` so the variables match Tailwind's namespaces. `--ease-*` generates real `ease-*` utilities; `--duration-*` is consumed via an arbitrary value like `duration-[var(--duration-base)]`, since Tailwind v4 has no duration namespace.

5. **Regenerate** and confirm the token lands in all four artifacts:

```bash
pnpm --filter @unbranded-ds/tokens build
```

The token appears in the Tailwind preset (`dist/tailwind/preset.css`), the per-theme CSS (`dist/css/tokens-*.css`), the TypeScript token map (`dist/ts/tokens.ts`), and the JSON map (`dist/json/tokens.json`).

Adding a required token is a breaking change for existing consumer themes, since they must now supply it or inherit it from the defaults. Pre-1.0 this is communicated by a minor version bump.

## Future structural opportunities

These are known design improvements not yet implemented. Documented here so consumers can evaluate the design space rather than just follow the recipe.

### Light defaults at `:root` for graceful degradation

Currently each built-in theme CSS file scopes its declarations under `[data-theme="<name>"]`. A consumer whose saved `unbranded-ds-theme` value does not match any currently-loaded theme (a custom theme registered at runtime but not yet loaded, a theme removed between versions, or garbage in localStorage) gets `data-theme="<value>"` set by the bootstrap script but no matching CSS. The page renders without theme CSS variables until JS loads and a valid theme is registered.

If `tokens-light.css` additionally emitted its declarations at `:root` — making light the no-attribute default — unknown `data-theme` values would degrade gracefully to "looks light-themed" instead of "looks unstyled." This is a tokens-package structural change; flag for a follow-up spec.

### Cookie-based server-side rendering

See "Path 2" in the FOUC prevention section above. A CSP-clean alternative to the inline bootstrap script for SSR apps. Roadmap item for the 0.3.0 release line.
