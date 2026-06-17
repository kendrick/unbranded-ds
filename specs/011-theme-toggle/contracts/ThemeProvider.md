# Contract: `<ThemeProvider>`

The single source of truth and the home for theme configuration. Mirrors `next-themes`' provider; one wraps the app (or a subtree).

## Import

```ts
import { ThemeProvider } from '@unbranded-ds/react';
```

## Props

```ts
interface ThemeProviderProps {
	children: React.ReactNode;
	/**
	 * Per-axis starting value, used until a stored preference loads. Falls back
	 *  to the tokens system constants ('light' aesthetic, 'comfortable' density).
	 */
	defaults?: Partial<Record<Axis, string>>;
	/**
	 * Per-axis pinned value. A forced axis is applied, overrides any stored
	 *  preference, and cannot change through set() (next-themes' forcedTheme).
	 */
	forced?: Partial<Record<Axis, string>>;
	/**
	 * Element the data-* attributes are written to. Defaults to
	 *  document.documentElement.
	 */
	root?: HTMLElement;
}
```

## Behavior

- Holds per-axis state and exposes it to every `useTheme()` in the subtree, so sibling controls stay in sync (FR-001).
- `defaults` seeds state before storage loads; a stored preference (or `forced`) wins once resolved.
- A `forced` axis is applied and locked: storage is ignored for it, a `set()` on it is a no-op that emits `THEME_AXIS_FORCED`, and a toggle bound to it renders disabled (FR-003, FR-014).
- Does not inject the first-paint bootstrap; the consumer still inlines `themeBootstrapScript` from `@unbranded-ds/tokens` (spec 002). The provider reconciles to storage on mount and never accesses `window` during render (FR-008).
- `root` lets a consumer scope theming to a subtree element instead of the document root.

## Notes

- This is a deliberate divergence from the brief's provider-less sketch, chosen so `forced` and shared multi-toggle state have a home, and to match the upstream pattern consumers already know.
- There is no `next-themes` runtime dependency; the provider is implemented in-repo (see [research.md](../research.md) §5).
