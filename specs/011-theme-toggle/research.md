# Phase 0 Research: Theme controls

Every `NEEDS CLARIFICATION` was resolved in the `/speckit.clarify` session; this file records those decisions plus the supporting best-practices for the new runtime code. Format: Decision / Rationale / Alternatives considered.

## 1. State container: `useSyncExternalStore` plus provider context

**Decision**: Hold theme state in a module-level store read through React's `useSyncExternalStore`, exposed via a `ThemeProvider` context. The provider seeds config (`defaults`, `forced`); the store owns the live values, the localStorage writes, and the `matchMedia` subscription.

**Rationale**: `useSyncExternalStore` is the SSR-safe primitive for external mutable state. `getServerSnapshot` returns the configured defaults with no `window` access, the client snapshot reads localStorage after mount, and React handles tearing across multiple `useTheme()` consumers so two sibling toggles never disagree (FR-001).

**Alternatives**: Plain `useState` in the provider renders fine but needs hand-wired `storage`/`matchMedia` effects and risks an SSR hydration mismatch; an external state library is unjustified weight for a single store.

## 2. `system` persistence keeps the spec-002 bootstrap frozen (clarify Q1)

**Decision**: The bootstrap key `unbranded-ds-theme` always holds a concrete value. A companion key, `unbranded-ds-theme-preference`, records the stated color-scheme intent including `system`. On mount the hook reads the companion key to re-enter `system` mode.

**Rationale**: The spec-002 bootstrap runs `setAttribute('data-theme', getItem(key) || default)` and knows nothing about `system`. Writing `system` to that key would set `data-theme="system"`, which no CSS matches, breaking SC-001 for system users. A concrete bootstrap key preserves no-flash with the bootstrap untouched.

**Alternatives**: Make the bootstrap `prefers-color-scheme`-aware, as next-themes' script is. Rejected: it reopens the frozen, CSP-hashed spec-002 bootstrap. Accept a flash for system users. Rejected: it weakens the headline criterion.

## 3. `matchMedia` subscription for live OS following

**Decision**: While a color-scheme preference is `system`, subscribe to `window.matchMedia('(prefers-color-scheme: dark)')` with `addEventListener('change', …)`, update `resolved` without writing to storage, and remove the listener on unmount or when the preference leaves `system`.

**Rationale**: This is the FR-007 behavior. `addEventListener` is the current API; the deprecated `addListener` is avoided. The subscription is feature-detected and attached only client-side, after mount.

**Alternatives**: Polling is wasteful and laggy. Subscribing on every axis is pointless, since only color-scheme has an OS signal today.

## 4. SSR render: unresolved until mounted (clarify Q7)

**Decision**: Toggles render immediately but in an unresolved state (no segment marked selected) until mounted, then reflect the stored preference.

**Rationale**: The page theme never flashes, because the bootstrap already set the attributes, so only the toggle's highlight is uncertain before mount. Rendering an unresolved control on both the server and the first client render avoids a hydration mismatch with no `suppressHydrationWarning`, and keeping the control in the layout avoids a shift.

**Alternatives**: Render the defaults with `suppressHydrationWarning` (mismatch risk plus a possible segment jump for non-default users); render `null` until mounted (layout shift as the control pops in).

## 5. No `next-themes` runtime dependency (clarify Q5)

**Decision**: Build the provider and hook in-repo; borrow next-themes' vocabulary and provider pattern only.

**Rationale**: next-themes is single-axis. It cannot represent multi-axis state, per-axis `forced`, or the density axis without contortion. The implementation is small (a provider, a store, one media subscription), and skipping the dependency keeps us off its Next.js-oriented assumptions while still handing consumers a familiar, predictable API.

**Alternatives**: Wrap next-themes for color-scheme and layer the rest on top (bridges a single-axis library into a multi-axis model); depend on it fully (conflates orthogonal axes into one value space).

## 6. `available` from the tokens registry, defaults included (clarify Q3 and Q4)

**Decision**: Add `themesForAxis(axis)` to `@unbranded-ds/tokens`, returning each axis's built-in values including its file-less default (such as `comfortable`), plus anything added at runtime via `registerTheme`. `useTheme().available` and the data-driven toggles read from it.

**Rationale**: The tokens package owns which themes exist per axis, so it is the only source that makes "a newly authored value appears with no component change" true. The default value is part of the axis even without an override file, so the registry surfaces it as a first-class member.

**Alternatives**: Consumer-configured `available` (bookkeeping, and the promise weakens to "for free once you update your config"); hardcoded per component (a new value means editing the component).

## 7. `<ThemeToggle>` is fixed light/system/dark over the aesthetic axis (clarify Q2)

**Decision**: `<ThemeToggle>` renders three fixed segments and targets the `aesthetic` axis. When the aesthetic value is `brand` or `vaporwave`, no segment is selected and the control stays enabled. The data-driven rule applies to `<DensityToggle>` and future axes only.

**Rationale**: Color-scheme is not yet its own axis (the split is deferred), so light and dark live on the aesthetic axis alongside brand and vaporwave. A fixed curated subset is honest about the shared slot and avoids inventing the mappings the split will later introduce.

**Alternatives**: Data-drive all aesthetic values (contradicts the three-segment intent and surfaces brand/vaporwave in a color-scheme control); disable on brand/vaporwave (less usable); map brand/vaporwave to an implicit light/dark (pulls the deferred split forward).

## 8. Failure modes: warn three, throw one (clarify Q6)

**Decision**: Route `THEME_INVALID_VALUE`, `THEME_AXIS_FORCED`, and `THEME_NO_SYSTEM_SOURCE` through the `warn()` helper (warn then no-op). Throw a structured error for `THEME_NO_PROVIDER`. Each failure carries a stable `code` field.

**Rationale**: The first three are recoverable dev mistakes that should not crash a page, matching the existing non-throwing `warn()` convention from spec 004. A missing provider has no usable state to return, so throwing surfaces the wiring bug at once. A uniform `code` field lets an agent match the warned and thrown cases the same way.

**Alternatives**: Warn on all four (a missing provider returns fabricated defaults and hides a real bug); throw on all four (a stray value crashes the page).

## 9. Icons

**Decision**: Color-scheme defaults to lucide `Sun` / `SunMoon` / `Moon`. Density defaults to a lucide pair that reads as roomy versus tight (working choice `Rows3` for comfortable, `Rows2` for compact), finalized during implementation. All overridable via `icons`.

**Rationale**: lucide-react is already a dependency, and those glyphs are the conventional color-scheme set. Density has no canonical icon, so the default is a best effort a consumer can override.

**Alternatives**: Text-only segments (less scannable at a glance); adding a new icon dependency (unjustified).
