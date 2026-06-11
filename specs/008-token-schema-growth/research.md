# Research: Token schema growth

**Phase 0 output** | **Date**: 2026-05-25

## Tailwind v4 motion namespaces (resolves the spec's flagged open item)

**Decision**: Easings emit as `--ease-{standard,decelerate,accelerate}`; durations emit as `--duration-{fast,base,slow}` plain CSS variables.

**Rationale**: The Tailwind v4 theme-namespace list includes `--ease-*` (generates `ease-<name>` utilities like `ease-standard`) but has **no `--duration-*` namespace**. Confirmed against the v4 docs namespace table: the motion-adjacent namespaces are `--ease-*` and `--animate-*` only; transition-duration utilities (`duration-200`) use the bare numeric scale, not a named theme namespace. So:

- `--ease-standard` → generates a real `ease-standard` utility (and `ease-decelerate`, `ease-accelerate`).
- `--duration-base` → a plain CSS variable. It does NOT auto-generate a `duration-base` utility. Consumers reference it via an arbitrary value (`duration-[var(--duration-base)]`) or directly (`transition-duration: var(--duration-base)`). The spec 010 retrofit will use one of those forms.

**Bonus finding**: the three easing values from FR-004 are exactly Tailwind's default easing curves, renamed by role:

| DS token | Value | Tailwind default equivalent |
| --- | --- | --- |
| `ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | `--ease-in-out` |
| `ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | `--ease-out` |
| `ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)` | `--ease-in` |

So the easing set is maximally conservative — it is the platform default, given semantic names that map to motion intent.

**Alternatives considered**: `--motion-*` category-prefixed naming (rejected — would not generate `ease-*` utilities, undercutting FR-006). Emitting both canonical + namespaced vars (rejected — doubles the motion vars for little gain).

## Typography additions follow the existing convention

**Decision**: `font-serif`, `size-2xl`, `size-3xl` are authored under the `typography` category and emit as `--typography-font-serif`, `--typography-size-2xl`, `--typography-size-3xl`, matching the existing `font-sans` / `size-sm` siblings.

**Rationale**: The current typography tokens are category-prefixed (`--typography-*`) and are CSS variables rather than Tailwind-namespace utilities. The new keys stay consistent with their siblings. Realigning the whole typography category to Tailwind's `--text-*` (font-size) and `--font-*` (font-family) namespaces would change every existing typography token's public name — a larger breaking refactor that belongs to its own spec, not here.

**Alternatives considered**: emitting `font-serif` as `--font-serif` (Tailwind's `--font-*` namespace, which would generate a `font-serif` utility). Rejected for this spec because it makes one typography token namespace-aligned while its siblings are not, trading one inconsistency for another. Worth revisiting if the whole typography category is ever realigned.

## DTCG types for the new tokens

**Decision**: Author with standard DTCG `$type` values consistent with the existing sources.

| Token | `$type` | Example `$value` |
| --- | --- | --- |
| `motion.duration.*` | `duration` | `120ms` |
| `motion.easing.*` | `cubicBezier` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `typography.font-serif` | `fontFamily` | `ui-serif, Georgia, Cambria, "Times New Roman", Times, serif` |
| `typography.size-2xl` / `size-3xl` | `dimension` | `1.5rem` / `1.875rem` |
| `ring.width` | `dimension` | `3px` |
| `z-index.*` | `number` | `50` |

**Rationale**: mirrors how the existing categories declare `$type` (`dimension`, `fontFamily`, `fontWeight`, `number`, `shadow`, `color`). The Style Dictionary `css` transform group already handles these; the TS token map records `$type` verbatim.

**Open sub-decision deferred to tasks**: the exact `font-serif` stack and the `2xl`/`3xl` rem values are conventional defaults (a system serif stack; 1.5rem / 1.875rem matching common scales). They are values, not architecture, and can be finalized during implementation.

## Resolve-then-validate (the Q1 rider)

**Decision**: Both `validateTheme` and the post-conversion contrast check in `registerTheme` merge the partial override onto the canonical default token set, then validate completeness + contrast on the merged result.

**Rationale**: The current contrast loops skip a pair when either side is absent (`validate.ts:83`, `runtime.ts:97`). Once the Zod schema is loosened to accept partial themes, that skip would silently pass a merged result that fails AA (override one side of a pair, inherit the other). Merging first closes the hole. The canonical defaults already exist as a build artifact (the generated token map / the resolved `src/tokens` set), so the merge needs no new data source — the validator imports the defaults and deep-merges the override on top.

**Mechanism**: loosen the Zod category objects to `.partial()` (or `.optional()` per key), add a `resolveTheme(partial)` helper that deep-merges onto the default token set, and run the existing Zod completeness check + contrast check against the resolved object. A token absent from both the override and the defaults is the only MISSING_TOKEN case — which guards the completeness of the defaults, not consumer themes.

**Alternatives considered**: validating the raw fragment (rejected — the AA hole). Unifying the DTCG and runtime formats (rejected in clarify — two real pipelines; see data-model).

## Built-in themes carry required tokens via inheritance, not duplication

**Decision**: The new required tokens (`font-serif`, motion, `2xl`/`3xl`) live in the `src/tokens` DTCG defaults. The built-in theme files (`light`/`dark`/`brand`) do NOT duplicate them; the Style Dictionary build merges the defaults under each theme, so the resolved per-theme CSS carries every required token.

**Rationale**: the build's source array is `['src/tokens/**/*.json', 'themes/<theme>.json']` — Style Dictionary deep-merges, defaults first. Requiring the themes to restate the new tokens would be redundant and drift-prone. FR-011 is satisfied by the resolved build output, not by the theme files literally carrying the keys.

## react patch is automatic

**Decision**: Ship one `@unbranded-ds/tokens: minor` changeset; let Changesets bump `@unbranded-ds/react` by patch.

**Rationale**: `.changeset/config.json` sets `updateInternalDependencies: "patch"`. `@unbranded-ds/react` depends on `@unbranded-ds/tokens` via `workspace:*`, so when tokens releases, react's published dependency range repoints at the new version and react gets a patch release. No separate react changeset is needed; no react source changes.
