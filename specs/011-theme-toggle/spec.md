# Feature Specification: Theme controls (provider, hook, and per-axis toggles)

**Feature Branch**: `011-theme-toggle`  
**Created**: 2026-06-13  
**Status**: Draft  
**Input**: User description: "Ship the for-coleman ThemeToggle pattern, reconsidered for the multi-axis theming the system gained in spec 009. Rather than variant components for theme combinations (vaporwave compact, dark brand expanded), compose independent per-axis controls over a single axis-aware hook, behind a provider that follows next-themes conventions."

**Depends on**: 002 (`themeBootstrapScript` and the storage keys), 004 (`SegmentedControl`, the underlying primitive), 005 (sidecar template and validator, Section XI), 009 (the two-axis token system this builds on), 013 (XI.2 compat-first vocabulary), 014 (resolution unification)
**Blocks**: 012 (the example app consumes these controls)

## Clarifications

### Session 2026-06-13

- Q: Do we need variant components for multi-axis theme combinations (e.g. `vaporwave compact`, `dark brand expanded high-contrast`)? → A: No. Named-composite variants are combinatorial and bake brand decisions into an unbranded DS. Combinations emerge instead from composing independent per-axis controls over one axis-aware hook.
- Q: Split color-scheme (light/dark) out of the aesthetic axis now, so `dark brand` and a clean `system` become expressible? → A: Defer. Ship over the two axes that exist today (aesthetic, density). The hook is axis-agnostic, so splitting color-scheme into its own axis later is purely additive, not a rewrite.
- Q: What shape is the multi-axis hook? → A: One `useTheme()` call returning per-axis maps, with a single `set(partial)` setter that takes one object and updates any subset of axes. No per-axis hook calls.
- Q: Provider, or the brief's provider-less hook? → A: A `ThemeProvider`, matching next-themes. It is the home for `defaults` and `forced` config and the single source of truth that keeps sibling controls in sync.
- Q: How do the names relate to next-themes? → A: Track upstream where a concept maps one-to-one (`forced`, `system`, `set`); rename only where the multi-axis shape forces it (`preference` for next-themes' `theme`, `resolved` for `resolvedTheme`). Document the mapping prominently.
- Q: Should `<ThemeToggle>` let a consumer drop the `system` segment? → A: No. Three segments always (light/system/dark). A two-state light/dark control is a documented `useTheme()` recipe in the sidecar.
- Q: How is a `system` color-scheme preference persisted so the unchanged spec-002 bootstrap stays flash-free? → A: The bootstrap key (`unbranded-ds-theme`) always holds a concrete `light`/`dark`; the `system` intent rides a separate companion key the hook reads on mount.
- Q: With color-scheme still on the aesthetic axis, what does `<ThemeToggle>` show when the value is `brand`/`vaporwave`? → A: Fixed light/system/dark segments (not data-driven). No segment is selected but the control stays enabled; choosing a segment overwrites the aesthetic value. The data-driven rule (FR-012) applies to density and future axes only.
- Q: Where does `available[axis]` come from, given the for-free promise and runtime `registerTheme`? → A: Derive it from the tokens package's theme registry (built-ins plus runtime-registered); add a per-axis "list themes" runtime export to `@unbranded-ds/tokens` if absent (in scope).
- Q: How does an axis's file-less default (e.g. `comfortable` density) appear in `available`? → A: The registry includes each axis's default value as a first-class member even with no override file, so `available.density` is [comfortable, compact].
- Q: Do we depend on `next-themes`, or only borrow its conventions? → A: Build our own provider and hook; borrow the vocabulary and provider pattern only, with no runtime dependency (`next-themes` is single-axis and cannot represent multi-axis state or per-axis `forced`).
- Q: Do the `THEME_*` failures throw or warn-and-continue? → A: `THEME_INVALID_VALUE`, `THEME_AXIS_FORCED`, and `THEME_NO_SYSTEM_SOURCE` warn via `warn()` and no-op; `THEME_NO_PROVIDER` throws, since there is no usable state to return.
- Q: What do toggles render before mount (SSR/hydration)? → A: An unresolved state (no segment selected) until mounted, then the stored preference. Server and first client render agree, so no mismatch and no layout shift.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Composable multi-axis theme state (Priority: P1)

A consumer wraps their app in a provider and reads or updates the theme through one hook. They set any combination of axes (aesthetic, density) in a single call, the choices persist per axis, and the first paint after a reload shows no flash.

**Why this priority**: The provider and hook are the load-bearing primitive. Every toggle and every downstream consumer builds on them, and they are the piece the for-coleman team said each app reimplements. Shipped alone, they already deliver the reusable core.

**Independent Test**: Wrap a tree in `<ThemeProvider>`, call `useTheme()`, read `resolved` and `preference`, call `set()` with a subset of axes, and verify persistence, live system-following, and flash-free first paint when the spec-002 bootstrap is inlined.

**Acceptance Scenarios**:

1. **Given** a `<ThemeProvider>` with the spec-002 bootstrap inlined in `<head>`, **When** the page reloads with a stored preference, **Then** no theme flash occurs and `resolved` matches what was stored.
2. **Given** `preference.aesthetic` is `system`, **When** the OS color scheme changes mid-session, **Then** `resolved.aesthetic` updates live without a reload and without writing to storage.
3. **Given** a mounted `useTheme()`, **When** `set({ density: 'compact' })` is called, **Then** density persists to its own key and the aesthetic axis is untouched.
4. **Given** server-side rendering, **When** the provider renders on the server, **Then** it returns defaults without touching `window` or `localStorage` and hydrates on the client without a mismatch.

### User Story 2 - Drop-in color-scheme toggle (Priority: P2)

A consumer drops `<ThemeToggle>` into their UI and gets the light/system/dark control they would otherwise rebuild: persisted, system-aware, keyboard-navigable, accessible.

**Why this priority**: This is the exact for-coleman pattern and the most visible win, and it completes the for-coleman scorecard at 6 of 6. It depends on US1 but delivers the recognizable artifact.

**Independent Test**: Render `<ThemeToggle>`, confirm three segments (light/system/dark), confirm that selecting a segment updates the aesthetic axis and persists, and confirm the live OS-change path.

**Acceptance Scenarios**:

1. **Given** a rendered `<ThemeToggle>`, **When** the user selects dark, **Then** the applied color scheme becomes dark and the choice persists across a reload.
2. **Given** the toggle set to `system`, **When** the OS scheme flips, **Then** the applied theme follows live.
3. **Given** `labels` and `icons` props, **When** provided, **Then** they override the English and lucide defaults; when absent, the defaults render.
4. **Given** the rendered control, **When** audited, **Then** it exposes an accessible group name and produces zero serious or critical accessibility violations.

### User Story 3 - A second axis, and combinations for free (Priority: P3)

A consumer drops a `<DensityToggle>` next to the `<ThemeToggle>`. Setting aesthetic to vaporwave and density to compact just works: the combination is the product of two independent controls, not a `vaporwave compact` variant anyone had to build.

**Why this priority**: It proves the compose-don't-enumerate model and spares consumers from rebuilding a density control, the same motivation as US2 applied to the second axis. It ranks below US2 only because color-scheme is the more universal need.

**Independent Test**: Render both toggles, set aesthetic to vaporwave and density to compact through them, and verify both `data-*` attributes apply independently.

**Acceptance Scenarios**:

1. **Given** both toggles rendered, **When** aesthetic is set to vaporwave and density to compact, **Then** both attributes apply and neither axis clobbers the other.
2. **Given** a newly authored density value (for example `expanded`), **When** it appears in `available.density`, **Then** `<DensityToggle>` renders a segment for it with no component change, labeled by the raw value when no override is supplied.
3. **Given** `<DensityToggle>`, **When** rendered, **Then** it has no `system` segment, because density has no OS signal.

### User Story 4 - Pin an axis (Priority: P4)

A consumer exposes one axis to end users and locks another to a fixed value: for example, an app that is always compact but lets users choose their color scheme.

**Why this priority**: It is a distinct capability (configuration, not interaction) that several consumers need, and it was an explicit requirement. It rides on the provider from US1.

**Independent Test**: Render `<ThemeProvider forced={{ density: 'compact' }}>`, verify density is applied while storage is ignored for it, verify a `<DensityToggle>` renders disabled, and verify `set({ density })` is a structured no-op.

**Acceptance Scenarios**:

1. **Given** `forced.density` is compact, **When** storage holds a different density, **Then** compact is applied (the forced value wins).
2. **Given** a forced density axis, **When** a `<DensityToggle>` is rendered, **Then** it is disabled.
3. **Given** a forced density axis, **When** `set({ density: 'comfortable' })` is called, **Then** the value does not change and a `THEME_AXIS_FORCED` structured failure is emitted.

### User Story 5 - Predictable, and documented as such (Priority: P5)

An agent or developer who knows next-themes can predict this API and find the alignment spelled out where they look: in TSDoc, in the sidecar, and in a short rationale note.

**Why this priority**: Agent legibility is the constitution-level differentiator, and clear documentation of how it matches next-themes and our own conventions was a hard requirement. It comes last only because it depends on the surface the other stories define.

**Independent Test (mechanical)**: Run the spec-005 sidecar validator and confirm each component's `*.usage.md` compiles; confirm the next-themes mapping appears in the hook's TSDoc and the sidecar. Whether the prose reads clearly is a humanizer-and-review gate, not an automated check.

**Acceptance Scenarios**:

1. **Given** the sidecar validator in CI, **When** a `*.usage.md` is missing or its `tsx` fails to compile, **Then** the build fails.
2. **Given** a reader who knows next-themes, **When** they open the hook's TSDoc, **Then** the mapping (`theme` → `preference`, `resolvedTheme` → `resolved`, `forcedTheme` → `forced`, `systemTheme` → `system`, `setTheme` → `set`) is documented inline.
3. **Given** the alignment note, **When** read, **Then** it states why the design is multi-axis and provider-based and links specs 002, 009, and 014.

### Edge Cases

- **Storage blocked** (private mode, blocked cookies): the provider falls back to `defaults` and does not throw, the same as the bootstrap's own try/catch.
- **Unknown stored value** for an axis (storage holds a value not in `available`): the axis resolves to its default and a `THEME_INVALID_VALUE` failure is emitted, rather than applying a value the build cannot render.
- **`system` on an axis with no OS signal** (e.g. `set({ density: 'system' })`): rejected with `THEME_NO_SYSTEM_SOURCE`.
- **`useTheme()` outside a provider**: a `THEME_NO_PROVIDER` failure that names the fix rather than falling back silently.
- **Two consumers of `useTheme()`** in one tree: both reflect a single state, because the provider is the source of truth.
- **OS signals other than color scheme** (reduced-motion, contrast): out of scope; the aesthetic axis, via its light/dark values, is the only one with an OS source today.

## Requirements _(mandatory)_

### Functional Requirements

**Provider**

- **FR-001**: A `ThemeProvider` MUST own theme state for every registered axis and be the single source of truth, so multiple controls render one consistent state.
- **FR-002**: The provider MUST accept per-axis `defaults`, falling back to the system constants from spec 002's runtime (`light` for aesthetic, `comfortable` for density).
- **FR-003**: The provider MUST accept per-axis `forced` values that are applied, take precedence over stored preferences, and cannot be changed through the hook.

**Hook**

- **FR-004**: `useTheme()` MUST return, per axis, the stated `preference` (which may be `system`) and the applied `resolved` value, plus `system` (the OS value where a signal exists), `forced`, and `available` (the allowed values per axis: each axis's built-in values from the tokens registry, including its file-less default such as `comfortable`, plus any registered at runtime via `registerTheme`).
- **FR-005**: `useTheme()` MUST return `set(partial)`, accepting one object keyed by axis that updates any subset of axes in a single call and persists each changed axis to its own storage key.
- **FR-006**: The hook MUST read and persist using the spec-002 keys (`unbranded-ds-theme`, `unbranded-ds-density`), so consumers who inline the bootstrap get no first-paint flash. The bootstrap-read key MUST always hold a concrete theme value: when a color-scheme preference is `system`, the resolved `light`/`dark` value is written to `unbranded-ds-theme` and the `system` intent is recorded in a separate companion key, so the unchanged spec-002 bootstrap never applies a non-existent `data-theme="system"`.
- **FR-007**: For any axis whose preference is `system` and which has an OS signal, the hook MUST subscribe to that signal, update `resolved` live without writing to storage, and remove the listener on unmount. On mount the hook MUST read the companion key to re-enter `system` mode rather than treating the concrete stored value as an explicit choice.
- **FR-008**: The provider and hook MUST render safely under SSR (defaults, no `window` or `localStorage` access) and reconcile to stored values on mount without a hydration mismatch. Until mounted, toggles MUST render in an unresolved state (no segment marked selected) so the server and first client render agree; the selected segment appears after mount, with no layout shift and no reliance on `suppressHydrationWarning`.
- **FR-009**: The hook MUST be axis-agnostic, typed over the shared `Axis` union, so a future axis (notably a split-out color-scheme axis) is additive: a new key across `preference`, `resolved`, `forced`, `available`, and `set`, with `<ThemeToggle>` re-pointing to it and nothing else changing. This is the planned seam for the color-scheme-split follow-up.

**Toggles**

- **FR-010**: A `ThemeToggle` MUST render a fixed three-segment color-scheme control (light / system / dark) targeting the `aesthetic` axis (color-scheme is not yet its own axis). Its segments are fixed, not derived from `available`. When the aesthetic value is `brand` or `vaporwave` and no segment matches, the control MUST show no selected segment yet stay enabled; selecting a segment overwrites the aesthetic value with `light`, `dark`, or `system`.
- **FR-011**: A `DensityToggle` MUST render a control over the density axis wired to the hook, with no `system` segment.
- **FR-012**: Axis toggles other than `<ThemeToggle>` (the `<DensityToggle>` and any future per-axis toggle) MUST derive their segments from `available[axis]`, so a newly authored axis value appears without a component change. `<ThemeToggle>` is the curated exception (FR-010): color-scheme exposes a fixed light/system/dark subset of the aesthetic axis rather than all its values.
- **FR-013**: Toggles MUST forward `size` and `orientation` to `SegmentedControl` (which exposes those, not `variant`), accept per-value `labels` and `icons` overrides (English and lucide defaults), pass through standard root props (`className`, `id`, ref, rest), and MUST expose an accessible group name (default "Color scheme" / "Density").
- **FR-014**: A toggle bound to a forced axis MUST render disabled.
- **FR-015**: Toggles MUST source their state from the provider and take no `value` or `onChange` props; a consumer wanting different UX composes on `useTheme()` directly.
- **FR-016**: The color-scheme sidecar MUST document a two-state (light/dark, no system) recipe built on `useTheme()`, since `<ThemeToggle>` itself always includes the `system` segment.

**Failures (Section XI.4)**

- **FR-017**: The system MUST emit structured failures, each with a stable `code` and the offending value. `THEME_INVALID_VALUE` (a value not in `available[axis]` and not `system`), `THEME_AXIS_FORCED` (a set on a forced axis), and `THEME_NO_SYSTEM_SOURCE` (`system` on an axis with no OS signal) MUST warn through the existing `warn()` helper and no-op, leaving the app running. `THEME_NO_PROVIDER` (`useTheme()` outside a provider) MUST throw a structured error carrying that code, since there is no usable state to return.

**Exports, vocabulary, and documentation**

- **FR-018**: `ThemeProvider`, `useTheme`, `ThemeToggle`, and `DensityToggle` MUST be exported from the package root.
- **FR-019**: Names MUST track next-themes where a concept maps one-to-one (`forced`, `system`, `set`) and diverge only where the multi-axis shape requires it (`preference` for next-themes' `theme`, `resolved` for `resolvedTheme`), per the compat-first reading of Section XI.2 (spec 013). This is vocabulary alignment only: the provider and hook are our own implementation with no runtime dependency on `next-themes`, which is single-axis and cannot represent multi-axis state or per-axis `forced`.
- **FR-020**: This feature MUST ship a convention-alignment writeup that (a) places the full next-themes mapping in `useTheme` TSDoc and the sidecars, with `ThemeProvider` and each toggle's TSDoc carrying a one-line pointer to it (the mapping describes the hook's fields, so duplicating the full table on every symbol is redundant); (b) opens each `*.usage.md` sidecar with an "if you know next-themes, here is the translation" framing; and (c) explains why the design is multi-axis and provider-based, cross-linking specs 002, 009, and 014.
- **FR-021**: Each component MUST ship a `*.usage.md` sidecar that passes the spec-005 validator.
- **FR-022**: All autodoc and sidecar prose MUST pass the humanizer audit, with no three-item-list tic.

**Stories and Storybook surface**

- **FR-023**: Each toggle MUST ship a `Default` story plus a story per meaningful variant and state, matching the bar `SegmentedControl` sets: sizes (sm/md/lg), orientations (horizontal/vertical), the forced/disabled state, and a custom `labels`/`icons` override. `<ThemeToggle>` additionally ships a system-following story whose `play` drives a `prefers-color-scheme` change, and the brand/vaporwave indeterminate state; `<DensityToggle>` ships a story that registers a theme so a data-driven value appears. Every story renders inside a `<ThemeProvider>` decorator.
- **FR-024**: A `Theming` story group MUST surface `useTheme` and `<ThemeProvider>` in Storybook, and therefore in the published MCP (Section XI.5), so the hook and provider are not visible only in the offline sidecar. It MUST include a compositional story that renders `<ThemeToggle>` and `<DensityToggle>` together and shows a multi-axis combination, such as vaporwave plus compact, emerging from the two independent controls. Its autodocs carry the next-themes mapping.

### Key Entities

- **Axis**: an independent theming dimension (aesthetic and density today), bound to a `data-*` attribute and its own storage key. The shared `Axis` union is the canonical list of axes.
- **Preference**: a user's stated choice for an axis. May be `system` for an axis that has an OS signal.
- **Resolved value**: the value actually applied for an axis after a `system` preference is resolved against the OS.
- **Forced value**: a provider-pinned value for an axis that overrides stored preferences and cannot be changed through the hook.
- **ThemeProvider**: the single source of truth holding per-axis state plus the `defaults` and `forced` configuration.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: With the bootstrap inlined, a page reload carrying a stored preference shows no theme flash; the rendered theme never changes after first paint.
- **SC-002**: Changing the OS color scheme while color-scheme is `system` updates the page within one frame, with no reload.
- **SC-003**: A consumer can set any combination of axes (for example vaporwave plus compact) in a single call, and each axis persists independently across reloads.
- **SC-004**: A consumer can expose one axis and pin another so that the pinned axis cannot be changed by an end user.
- **SC-005**: Both toggles are fully operable by keyboard and produce zero serious or critical accessibility violations.
- **SC-006**: A reader who knows next-themes can correctly predict the hook's fields and the toggle behavior from the documented mapping, without reading the source.
- **SC-007**: A missing or non-compiling sidecar fails the build.
- **SC-008**: An agent querying the published MCP can discover `useTheme` and `<ThemeProvider>` and find a worked example of two axes combining, not only the offline sidecar.

## Assumptions

- Color-scheme stays a value set on the aesthetic axis for now. Splitting it into its own axis is a deliberate near-term follow-up; the axis-agnostic hook makes that split additive rather than a rewrite (decided 2026-06-13).
- The provider model is a conscious divergence from the brief's provider-less `useTheme` sketch, justified by pinning, shared state, and next-themes compatibility (Section XI.2, spec 013).
- Density carries `comfortable` (default) and `compact` today. `expanded`, and any contrast or high-contrast axis, are not yet authored and are out of scope; the data-driven toggles absorb new values when they land.
- The hook uses `system` (next-themes' term) rather than the brief's `auto`, following the compat-first vocabulary.
- Color-scheme icons default to Sun / SunMoon / Moon; density uses a sensible lucide pair, with exact glyphs chosen at implementation.
- `useTheme()` requires a `ThemeProvider` ancestor, as next-themes does; calling it without one is the `THEME_NO_PROVIDER` failure, not a silent fallback.
- Multi-tab synchronization via the `storage` event is optional and may be deferred; it is not required for acceptance.
- Deriving `available` from the tokens registry assumes (or adds) a per-axis "list registered themes" runtime export from `@unbranded-ds/tokens`; providing it if absent is in scope for this feature.

## Out of Scope

- A switch-style two-state toggle as its own component (covered by the documented `useTheme()` recipe).
- Theme preview thumbnails in a toggle.
- A multi-tenant theme registration UI.
- Splitting color-scheme into its own axis (the planned follow-up this spec leaves a seam for).
- Authoring new density values or a contrast axis.
