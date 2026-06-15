---
"@unbranded-ds/react": minor
"@unbranded-ds/tokens": minor
---

Add theme controls: a `ThemeProvider`, the axis-aware `useTheme()` hook, and the `<ThemeToggle>` and `<DensityToggle>` sibling controls. The tokens package gains a browser-safe `themesForAxis()` registry export and now also exports the `Axis` type, `AXIS_ATTRIBUTE`, and the storage-key constants (including a new `THEME_PREFERENCE_STORAGE_KEY`) that the hook reads for its per-axis value lists and flash-free `system` persistence.
