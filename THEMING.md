# Theming

Themes are just CSS variables scoped to a `[data-theme]` selector. Every component reads its colors, spacing, radii, etc. from these variables through Tailwind utilities. Swap the attribute, swap the look. No component code changes.

Three themes come built in: light, dark, and brand.

## Writing a custom theme

A theme is a JSON file. Every token in the schema needs a value — skip one and validation will tell you which.

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
} else {
	for (const issue of result.issues) {
		console.error(`${issue.code}: ${issue.message} (at ${issue.path})`);
	}
}
```

It checks two things: that every required token exists with the right type, and that foreground/background color pairs hit WCAG AA contrast (4.5:1).

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

## Avoiding the theme flash (FOUC)

If you're saving theme preference to localStorage, the page will briefly show the default theme before your JS runs. Fix that with a blocking script in `<head>`:

```html
<script>
	(function () {
		var theme = localStorage.getItem('ds-theme') || 'light';
		document.documentElement.setAttribute('data-theme', theme);
	})();
</script>
```

It runs before paint, so the right theme is already set when the page renders.

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
