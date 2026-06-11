# Spec 011 — ThemeToggle

**Target version:** next minor bump after specs 005, 008, and 010 have shipped
**Depends on:** 002 (themeBootstrapScript pairs with the toggle), 004 (SegmentedControl is the underlying primitive), 005 (sidecar template and AGENTS.md exist)
**Blocks:** 012 (example app uses the toggle)
**Bundles for-coleman items:** A.2

---

## Motivation

The for-coleman team described `<ThemeToggle>` as a pattern every DS-driven app rebuilds. The pattern is well-defined (localStorage persistence plus system fallback plus a live media-query listener for the auto state) but each consumer reimplements it.

This is the last for-coleman item to land. After this spec ships, the for-coleman scorecard is 6 of 6.

---

## For-coleman context (A.2)

The for-coleman team built their own `<ThemeToggle>` and proposed shipping it upstream:

> Three-state segmented control. Persists to `localStorage` (key `'theme'`). When in `auto`, listens to `prefers-color-scheme` changes mid-session. Sets `data-theme` on `document.documentElement`. Accessible: semantic `<fieldset>` + radio inputs, visually-hidden but keyboard-navigable.

Suggested location: `packages/react/src/components/ThemeToggle/`.
Reference: `components/theme-toggle.tsx` in for-coleman. ~100 lines + ~40 lines of CSS.

### Triage modification

The proposed component bakes in three opinions: the localStorage key, the use of `document.documentElement`, and a specific three-state UX (light/auto/dark). For an "unbranded" DS that's heavy commitment. Counter-proposal from the workshop:

Ship two pieces and let consumers compose:

1. **`useTheme()` hook** — owns the localStorage key (`unbranded-ds-theme`, matching `themeBootstrapScript` from spec 002), the `data-theme` selector, the system-fallback behavior, and the live `prefers-color-scheme` listener. Returns the current theme, an explicit-preference value (`'light' | 'auto' | 'dark'`), and a setter.

2. **`<ThemeToggle>` component** — a thin shell on top of `<SegmentedControl>` (from spec 004) and `useTheme()`. About twenty lines. Consumers who want a different UX (a switch, a button cycle, a dropdown) compose their own using `useTheme()` directly.

The hook is the load-bearing primitive; the component is a default convenience.

---

## Scope

### `useTheme()` hook

- Located at `packages/react/src/hooks/useTheme/useTheme.ts`
- Reads and persists to `localStorage.getItem('unbranded-ds-theme')` (key matches `themeBootstrapScript` from spec 002 — consumers who use the bootstrap script get no flash on first paint)
- Returns:
  - `theme`: the currently-applied theme (`'light' | 'dark' | <consumer-registered theme name>`)
  - `preference`: the user's stated preference (`'light' | 'auto' | 'dark'`)
  - `setPreference(next)`: updates localStorage and applies the new theme
- When preference is `'auto'`, subscribes to `prefers-color-scheme` and updates `theme` live as the OS preference changes (without writing to localStorage)
- Sets `data-theme` on `document.documentElement` (overridable via an optional `root` parameter)
- Safe in SSR (returns sensible defaults during first render, hydrates on mount)

### `<ThemeToggle>` component

- Located at `packages/react/src/components/ThemeToggle/`
- Renders a three-segment `<SegmentedControl>` (light/auto/dark) wired to `useTheme()`
- Labels are translatable via props; defaults are English
- Each segment has an accessible label and an icon (lucide-react icons: Sun, SunMoon, Moon, or similar)
- Honors the constitution's prose rules in autodocs and sidecar
- Ships with a `<ThemeToggle>.usage.md` sidecar per Section XI

## Out of scope

- A switch-style two-state toggle (light/dark without auto) — consumers can compose this on `useTheme()` directly
- Theme preview thumbnails in the toggle — premature
- Multi-tenant theme registration UI — that's a different concern
- Custom theme names beyond light/auto/dark in the toggle UI — the toggle ships with three segments; consumers wanting more compose their own

## Acceptance criteria

- `useTheme()` hook exported from the package root
- `<ThemeToggle>` component exported from the package root
- When a consumer wires `themeBootstrapScript` (from spec 002) plus `<ThemeToggle>` plus `useTheme()`, no theme-flash occurs on page reload
- Switching the OS color scheme while the toggle is in `auto` updates the page live without a reload
- The toggle is keyboard-navigable (arrow keys move between segments, Space/Enter selects)
- Zero `serious` or `critical` axe violations
- Component honors all of Section XI: humanizer pass on prose, predictable slot names (`<ThemeToggle.Segment>` if there's a slot), structured failure output if invalid preference values are passed, sidecar `*.usage.md` present
- Stories cover: default state, each preference value selected, the live `prefers-color-scheme` change interaction
- Unit tests cover the hook's localStorage read/write, the media-query listener subscription/cleanup, and the SSR-safe initial render

## Constitution check

Section XI is ratified at this point (spec 005). All of it applies:

- Sidecar `<ThemeToggle>.usage.md` ships with the component
- Autodocs prose passes humanizer
- Slot names match the established vocabulary
- The hook's return shape is structured (object with named fields, not a tuple) so agents can pattern-match
- No three-item lists in prose

## References

- [TODO.md](TODO.md) section A.2 — original for-coleman proposal
- [/tmp/feedback-triage.md](/tmp/feedback-triage.md) — the modification rationale (split into hook + component)
- [packages/react/src/components/SegmentedControl/](packages/react/src/components/SegmentedControl/) — the underlying primitive (lands in spec 004)
- `packages/tokens/src/runtime.ts` — exports `themeBootstrapScript` after spec 002, uses the same `unbranded-ds-theme` localStorage key
- Constitution Section XI (ratified in spec 005)
