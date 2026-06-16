# Phase 0 Research: Color-scheme and theme axis split

Grounded in the current implementation (mapped from source). Each decision states what was chosen, why, and what was rejected.

## 1. Axis naming

**Decision**: Rename the `aesthetic` axis to `theme` and add a `colorScheme` axis. The axis set becomes `theme` (`data-theme`, values `default`/`brand`/`vaporwave`), `colorScheme` (`data-color-scheme`, values `light`/`dark`), and `density` (`data-density`, unchanged).

**Rationale**: The steer fixed the vocabulary (theme means identity, color scheme means light/dark). That only holds if the axis key, the data attribute, and the control name agree. `data-theme` already exists and stays on the identity axis, so renaming the internal key `aesthetic` to `theme` aligns all three. `Axis` is a union threaded through `axis-constants`, `registry`, the store, and `useTheme`'s axis-keyed shape, so adding `colorScheme` flows automatically once the union and the three maps (`AXIS_ATTRIBUTE`, `BUILT_IN_THEMES`, the store's `SYSTEM_MEDIA`/`SYSTEM_DEFAULTS`/`STORAGE_KEY`) gain the key.

**Alternatives considered**: Keep `aesthetic` and add `colorScheme`. Rejected: it leaves the identity axis named `aesthetic` while the attribute and the user-facing word are `theme`, re-creating the conflation in the names. A clean rename is safe because there are no external consumers.

## 2. Token architecture: per-combination palettes

**Decision**: Each identity-by-color-scheme combination is a complete authored palette, not a delta layered over a shared base. Express it as: the color-scheme axis emits the default identity's two schemes (`[data-color-scheme="light"]` is the base token set, `[data-color-scheme="dark"]` is the full dark set) in a `ds-color-scheme` layer; each non-default identity emits a full palette per scheme under a compound selector (`[data-theme="brand"][data-color-scheme="dark"]`) in a `ds-theme` layer; density stays a delta in `ds-density`. Cascade order: `@layer ds-color-scheme, ds-theme, ds-density;`.

**Rationale**: The clarify session chose "authored per combination" precisely to avoid algorithmic derivation and the contrast risk of layering one identity over two schemes. Full palettes per combination let the validator check each of the six shipped palettes (`default`/`brand`/`vaporwave` times `light`/`dark`) directly against WCAG AA. The compound selector plus the layer order make the identity palette win over the bare color-scheme base, and density win over both, deterministically (layers beat specificity, as today). `default` needs no theme file (the color-scheme base is the default identity), mirroring how `comfortable` density is file-less.

**Alternatives considered**: Orthogonal layers (a color-scheme base plus an identity delta that composes). Rejected in clarify (Q1): a delta authored once cannot stay AA-correct over both light and dark backgrounds, which is exactly the failure spec 015 surfaced. The build change to emit per-combination compound selectors is the cost of doing it right.

## 3. The themes directory and the build

**Decision**: Reorganize `themes/` so the directory encodes the axis and, for the theme axis, the identity and scheme: `themes/color-scheme/dark.json` (light is the file-less base), and `themes/theme/<identity>/<scheme>.json` (`themes/theme/brand/light.json`, `.../brand/dark.json`, `.../vaporwave/light.json`, `.../vaporwave/dark.json`). `themes/density/compact.json` is unchanged. The Style Dictionary config (`sd.config.ts`) gains per-combination emission: color-scheme files source the full base and emit under `[data-color-scheme="<name>"]` in `ds-color-scheme`; theme files source the full base and emit under the compound `[data-theme="<identity>"][data-color-scheme="<scheme>"]` in `ds-theme`; density is the existing delta path. Update the `layer-order` line and the comment.

**Rationale**: The build already derives the axis from the directory, so extending the convention (a nested identity/scheme level for the theme axis) keeps the single-source-of-truth property the build, MCP, and validator all rely on. Emitting per combination is what realizes decision 2.

**Alternatives considered**: A flat `themes/` with combination names (`brand-dark.json`). Rejected: the nested layout reads as a matrix and keeps "what axis is this" obvious. Keeping aesthetic files as full single-attribute sets. Rejected: that is the conflated model.

## 4. Storage keys and the bootstrap

**Decision**: Color scheme gets `unbranded-ds-color-scheme` (the concrete bootstrap value) and `unbranded-ds-color-scheme-preference` (the stated intent, including `system`). `unbranded-ds-theme` is repurposed to hold the identity. `unbranded-ds-density` is unchanged. `getThemeBootstrapScript` reads three concrete keys and writes three attributes (`data-color-scheme`, `data-theme`, `data-density`) in one try-block, with `defaultColorScheme`/`defaultTheme`/`defaultDensity` (defaults `light`/`default`/`comfortable`); the catch sets all three. No migration of stored values.

**Rationale**: `unbranded-ds-theme-preference` already holds the light/dark/system intent, so it maps cleanly to the color-scheme preference. Keeping `system` out of any bootstrap-read key preserves the flash-free design (the bootstrap never resolves `system`; the store writes a resolved concrete value to the bootstrap key, as today). With no consumers, the rename is clean and needs no migration shim. The bootstrap string changing means its CSP hash changes, which is expected and documented.

**Alternatives considered**: Reuse `unbranded-ds-theme` for the color-scheme concrete value and add a new identity key. Rejected: it fights the vocabulary (the `theme` key should hold the theme/identity).

## 5. The store and `system`

**Decision**: In `themeStore.ts`, move `'(prefers-color-scheme: dark)'` from `SYSTEM_MEDIA.aesthetic` to `SYSTEM_MEDIA.colorScheme`, add `colorScheme: 'light'` to `SYSTEM_DEFAULTS`, add the color-scheme key to `STORAGE_KEY`, and change the hardcoded `attachMedia` reference from `SYSTEM_MEDIA.aesthetic` to `.colorScheme`. `resolvePreference` is unchanged.

**Rationale**: `system` and OS-following are a color-scheme concern; this move is the functional heart of the split on the React side. The store is otherwise axis-agnostic (it loops `AXES`), so once the maps name `colorScheme`, attributes, persistence, and forcing all work for it for free.

## 6. `useTheme` surface

**Decision**: Keep the axis-keyed shape (`preference`/`resolved`/`system`/`forced`/`available`/`set` over `theme`, `colorScheme`, `density`) and add a top-level `colorScheme` convenience: a getter for the resolved value and a setter that calls `set({ colorScheme })`. Document the `next-themes` mapping in the hook sidecar: `resolvedTheme` to `colorScheme.resolved`, `systemTheme` to `colorScheme.system`, `theme` to the identity axis.

**Rationale**: Color scheme is the axis consumers reach for most (toggle light/dark), so a convenience avoids the verbose `set({ colorScheme: 'dark' })` for the common case while the axis map stays the source of truth (clarify Q5). The documented mapping resolves the "what does theme mean" tension for both human and agent readers (FR-012, Section XI).

**Alternatives considered**: A pure axis map (rejected: the common operation is verbose) or a next-themes-shaped facade where `theme` means color scheme (rejected: re-overloads `theme`).

## 7. Controls

**Decision**: Rename the existing fixed light/system/dark `ThemeToggle` to `ColorSchemeToggle` and change its single wired axis from `aesthetic` to `colorScheme`. Add a new `ThemeToggle` that drives the `theme` (identity) axis, data-driven from `themesForAxis('theme')`, mirroring `DensityToggle`. Export both from `index.ts`. `AxisToggle` and `DensityToggle` are unchanged.

**Rationale**: The existing control already renders light/system/dark with the group label "Color scheme"; only its `axis` attribute is wrong. Reusing the `ThemeToggle` name for the identity control matches the vocabulary (theme means identity). The new control is the `DensityToggle` pattern applied to the identity axis, so it is small.

**Alternatives considered**: `IdentityToggle` for the new control (rejected in clarify: diverges from the "theme" vocabulary) or keeping `ThemeToggle` on color scheme (rejected: contradicts `data-theme` meaning identity).

## 8. The contrast validator

**Decision**: Add one pair to `contrastPairs` in `schema.ts`: `{ foreground: 'color.muted-foreground', background: 'color.background', threshold: 4.5 }`. The existing `muted-foreground`/`muted` pair stays.

**Rationale**: The architecture map corrected the spec's framing: `muted-foreground`/`muted` is already checked. The pair that slipped through in spec 015 is muted text rendered on the base `background` (a card colored `background` with `muted-foreground` text), which axe flagged but the validator never checked. Adding it flows automatically into `validateResolved`, the post-conversion check in `runtime.ts`, and the MCP contrast tool, all of which iterate `contrastPairs`. Every shipped identity-by-scheme palette is then validated against it.

## 9. The in-repo cutover (no external codemod)

**Decision**: Update every in-repo consumer in the same change and ship no public codemod or deprecation shim. The list (from the map): the example app (`globals.css` override selector to `[data-color-scheme]`, `pinned-vaporwave.tsx` forced keys and attributes, the Playwright specs asserting `data-color-scheme` for light/dark, the header is unchanged in shape but gains the new `ThemeToggle`); Storybook (`preview.ts` splits its one toolbar global into color-scheme and theme globals writing two attributes; fix the stale `preview-head.html` that reads the wrong `ds-theme` key and sets only `data-theme`); the package stories and tests (`_theming/Composition.stories.tsx`, the toggle stories and tests, the `useTheme`/store tests); and the tokens self-references (`mcp/compose.ts`, `mcp/tools/listThemes.ts`, `runtime.test.ts`, `axes.test.ts`).

**Rationale**: With no external consumers, back-compat machinery is dead weight (clarify Q4). Updating the repo's own consumers in the same PR keeps `main` consistent and is the only "migration" needed. The stale `preview-head.html` key is a pre-existing bug worth fixing while here.

## 10. Governance

**Decision**: Amend Constitution Section III to the three-axis model (add color scheme, rename aesthetic to theme, new layer order, the `system`/color-scheme wording), MINOR bump with a SYNC IMPACT REPORT; add a `.changeset/*.md` declaring both packages bump minor.

**Rationale**: Section III states the two-axis model normatively, and this feature changes it, so the change must be ratified rather than silently diverging (Section X: drift is a bug in the spec, not the constitution). The 1.2.0 amendment (per-axis composition) is the precedent for the bump shape.
