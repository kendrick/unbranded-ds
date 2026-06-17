# Phase 0 Research: Popover tokens and the Dialog description contrast fix

All decisions below are grounded in the current code (read 2026-06-17), not assumption. The clarify session (2026-06-17) already settled the three shaping decisions; this research records how they land against the actual token build.

## D1 — The popover surface is a new canonical color token pair

**Decision**: Add `popover` and `popover-foreground` to the `colorTokens` Zod object in `packages/tokens/src/schema.ts`, alongside the existing `background`/`foreground`/`muted`/`destructive-subtle` surface tokens.

**Rationale**: `Dialog.tsx:277`, `Tooltip.tsx:200`, and `Select.tsx:303` all style their content surface with `bg-popover` / `text-popover-foreground`, but `colorTokens` defines no `popover` — the only `popover` token anywhere is `--z-index-popover`. So those classes resolve to unset CSS variables and the surfaces have no fill. The constitution's rule (Section III/IV) is that components reference canonical token names only; the honest fix is making `popover` canonical, which the schema has grown by spec before (`destructive-subtle` in spec 018, the matrix split in spec 016). The `--z-index-popover` and `--color-popover` names share the `popover` stem but different prefixes, so they do not collide.

**Alternatives considered**: Repoint the three components to `background`/`foreground` (rejected in clarify — bakes "popover == background" permanently and drops a surface concept shadcn/Base UI assumes). A preset-level CSS alias (rejected — leaves popover non-canonical and unvalidatable). Both are recorded in the spec's Clarifications.

## D2 — Each cell's popover equals its own background; no shared color changes

**Decision**: In every palette file, set `popover` to that file's `background` value and `popover-foreground` to its `foreground` value. Change no existing token, `muted-foreground` included.

**Rationale**: `muted-foreground` / `background` is already one of the six validated `contrastPairs` (`schema.ts:192`), so it clears AA in every shipped cell today. With `popover` equal to `background`, the Dialog description's `muted-foreground` text resolves to that already-passing relationship. The 3.98:1 failure the gate reported was never about the text color; it was the transparent surface letting the overlay (`#e6e6e7`) show through. The components already carry their elevation as `ring-1 ring-foreground/10` + `shadow-md`, so a flat fill reads as raised without a distinct tone. This matches shadcn's default, where popover mirrors the base surface.

**Alternatives considered**: A distinct elevated popover tone (rejected in clarify — adds per-cell authoring and contrast work for no visual need given the ring/shadow). Darkening `muted-foreground` globally the way spec 018 tuned the destructive pair (unnecessary here, and it would ripple to every other muted-text usage).

## D3 — The six palette files that must each gain the pair

**Decision**: Add the two tokens to all six authored color palettes, each using that palette's own `background`/`foreground`:

- `packages/tokens/src/tokens/color.json` (default identity, light — the canonical base)
- `packages/tokens/themes/color-scheme/dark.json` (default, dark)
- `packages/tokens/themes/theme/brand/light.json`
- `packages/tokens/themes/theme/brand/dark.json`
- `packages/tokens/themes/theme/vaporwave/light.json`
- `packages/tokens/themes/theme/vaporwave/dark.json`

**Rationale**: Each file carries a complete color palette (every color key is re-declared with that cell's values), not a sparse delta — confirmed by reading `dark.json` and `brand/light.json`. Because `popover` differs per cell (it equals each cell's distinct `background`), every cell must declare it explicitly; inheriting the base would give dark and brand the light popover. Completeness is enforced on the composed theme by `validateComposedTheme`, so a missing pair fails the build, not ships.

## D4 — The matrix contrast test covers the new pairs for free

**Decision**: Add two entries to the `contrastPairs` array in `schema.ts` — `popover-foreground` / `popover` and `muted-foreground` / `popover`, both at threshold 4.5 — and add nothing to `themes-contrast.test.ts`.

**Rationale**: `themes-contrast.test.ts` loops its six cells through `validateComposedTheme`, which validates "every declared contrast pair." It derives the pairs from the exported `contrastPairs`, so the two new entries are automatically checked across all six cells. This mirrors how `background` is guarded by two pairs (`foreground`/`background` and `muted-foreground`/`background`), the coverage the clarify session chose so a future identity that diverges popover from background cannot silently ship inaccessible. `schema.test.ts:78` asserts `contrastPairs` has length 6 and must move to 8.

## D5 — defaults.generated.ts, the preset, and CSS emission regenerate from the build

**Decision**: Do not hand-edit generated artifacts. After editing the schema, the six palettes, and the token map, run `pnpm --filter @unbranded-ds/tokens build` to regenerate `defaults.generated.ts`, the Tailwind preset, the per-theme CSS, and the resolved-delta JSON.

**Rationale**: `defaults.generated.ts` carries the banner "AUTO-GENERATED by sd.config.ts — do not edit"; `sd.config.ts` writes it (`destination: 'defaults.generated.ts'`) and emits the CSS variables via the `name/kebab` transform, so `color.popover` becomes `--color-popover`. Tailwind v4's `@theme` then auto-generates the `bg-popover` / `text-popover-foreground` utilities the components already use, so no component class changes. `token-map.ts` is hand-authored (one literal per token), so it needs two new `source: 'schema'` entries (`color.popover`, `color.popover-foreground`); the token-query MCP reads the map, so it then exposes the new tokens with no MCP code change.

## D6 — The React side is the quarantine removal only

**Decision**: The only `packages/react` change is removing the spec-020 `color-contrast` quarantine from the two Dialog stories (`Dialog.stories.tsx`, `OpenCloseInteraction` and `TooltipStacksAboveDialog`). No component source changes.

**Rationale**: The components already reference the popover surface; once the token emits, they render opaque with no code edit (FR-007). The Dialog panel's visible fix arrives entirely through the tokens package's emitted CSS. Tooltip and Select content gain the same real surface and must stay green on their existing stories.

## D7 — Versioning: minor on tokens, patch on react

**Decision**: One changeset declaring `@unbranded-ds/tokens` minor and `@unbranded-ds/react` patch.

**Rationale**: Growing the canonical token set is an additive, non-breaking feature for the tokens package — a consumer's partial theme merges onto `canonicalDefaultTokens`, so a consumer who never declares `popover` inherits the default rather than breaking. That is a minor bump, consistent with how the schema has grown before. The react bump is a patch: its published bundle is effectively unchanged (only a stories file, which is not shipped), but the Dialog, Tooltip, and Select surfaces now render opaque for consumers, a user-visible fix worth recording in react's changelog, and the constitution's per-PR changeset rule applies because the PR touches `packages/react`.

**Alternatives considered**: Major on tokens (rejected — no consumer breakage, partial themes inherit). No react entry (rejected — the PR touches `packages/react` and consumers see the surface change through the components, so it belongs in react's changelog).
