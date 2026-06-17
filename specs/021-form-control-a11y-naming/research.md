# Phase 0 Research: Fix the accessible-name pattern in form-control docs

All decisions below are grounded in the current code (read 2026-06-17), not assumption.

## D1 — The `warn()` house pattern: compute at render, emit in `useEffect`

**Decision**: Mirror the existing Slider validation pattern. Compute the warning condition during render, emit it from a `useEffect` keyed on the condition.

**Rationale**: `Slider.tsx:319-325` already does exactly this for its clamp warnings, with the comment "Warnings emit on the client only — `useEffect` doesn't run on the server, which keeps SSR output clean and avoids re-emitting on every render." That satisfies Constitution IX.6 (no browser-only work at render) and prevents per-render console spam. `warn()` itself (`lib/warn.ts`) is a thin `console.warn('[unbranded-ds]', payload)` with no dedup or gating, so timing and gating are the caller's job — same as Slider.

**Alternatives considered**: Warn during render (rejected — runs on the server for an RSC, prints SSR-side noise, re-emits each render). A module-level dedup `Set` (rejected — no stable per-instance key; complexity not worth it for a dev-only message).

## D2 — Detection lives in a shared dev-only hook

**Decision**: Add `useAccessibleNameWarning(component, props)` in `packages/react/src/lib/use-accessible-name-warning.ts`. It reads `aria-label`/`aria-labelledby` off the passed props, and in a `useEffect` emits one `warn()` when both are absent, unless `process.env.NODE_ENV === 'production'`. Checkbox, Switch, and SliderThumb each call it.

**Rationale**: One tested place for the SSR-safe timing, the prod gate, and the predicate, rather than three copies. The "named" predicate is non-empty `aria-label` OR non-empty `aria-labelledby` (an empty string names nothing, so it must not count). The payload uses the established shape: `{ component, issue: 'missing-accessible-name', remedy: 'Add aria-label, or aria-labelledby referencing a visible label.' }` — a new `issue` code alongside the existing `no-items` / `invalid-bounds` / `value-out-of-range` codes, agent-parseable per Constitution XI.4.

**Alternatives considered**: Inline per component (rejected — three copies of the same SSR/gate logic to test). Computed accessible name from the DOM (rejected in the clarify pass — props-only by decision).

## D3 — The Slider warning checks each `SliderThumb`, not the Root

**Decision**: Call the hook from `SliderThumb` (each thumb checks its own `aria-label`/`aria-labelledby`), not from `SliderRoot`.

**Rationale**: The `role="slider"` element is the Thumb (`Slider.tsx:414-433`). Checking per-thumb handles single and range modes uniformly: every thumb needs its own name, which is exactly the documented range pattern (`Slider.Thumb aria-label="Minimum price"`). A Root-level check would false-positive on the correct range pattern (per-thumb labels the Root can't see) and depends on whether Base UI forwards a Root `aria-label` to the thumb input — an ambiguity the per-thumb check sidesteps. Every existing Slider story already labels its thumb (`aria-label="Value"`), so no story regresses; the only thing that newly warns is the basic `@example` (`<Slider.Thumb />`), which D6 fixes anyway.

**Alternatives considered**: Root-level prop check (rejected — false-positives the range pattern). Forwarding-aware logic (rejected — needs DOM/Base UI internals; props-only by decision).

## D4 — "Exactly one" means once per mount; no module-level dedup

**Decision**: The `useEffect` deps are `[component, named]`, so it fires once per mount and not on re-renders. We do not add cross-render/instance deduplication.

**Rationale**: Matches the Slider clamp warnings, which also fire once per mount via `useEffect` with no dedup. React StrictMode's intentional dev double-invoke may emit twice in development; this is consistent with every other `warn()` in the codebase and not worth special-casing for a dev-only message. The unit test renders without StrictMode and asserts a single call.

## D5 — Production gate (the one difference from existing warnings)

**Decision**: The naming hook early-returns when `process.env.NODE_ENV === 'production'`. The existing Slider clamp warnings do not gate this way.

**Rationale**: FR-007 requires dev-only. A clamp is a data bug worth surfacing in any environment; a missing accessible name is a dev-time authoring issue, so it is gated and dead-code-eliminated from consumer production bundles.

## D6 — The corrected doc pattern mirrors the spec-019 stories exactly

**Decision**: Copy the naming pattern the spec-019 story fixes already established into the `@example` blocks and sidecars. The native label is kept for interaction; `aria-labelledby` is added for the name.

**Rationale**: The bug is that a native `<label>` toggles the hidden input but does not name the `role="checkbox"`/`"switch"` element. The fix is additive, and the stories are the reference:
- **Checkbox** (`Checkbox.stories.tsx:34-37`): keep the wrapping `<label>` (click-to-toggle via the hidden input), add `aria-labelledby="id"` on the Checkbox, point it at `<Label id="id">`. Unlabeled: `aria-label` on the Checkbox.
- **Switch** (`Switch.stories.tsx:52-53`): `<Switch id="x" aria-labelledby="y">` with `<Label id="y" htmlFor="x">` — `htmlFor` gives click-to-toggle, `aria-labelledby` gives the name. Unlabeled: `aria-label`.
- **Slider** (`Slider.tsx:524-525`): the range `@example` already labels each thumb; only the basic `@example` (`<Slider.Thumb />`) needs a name.

The current `@example`/sidecar pattern (Checkbox wraps a bare `<label>`; Switch uses `htmlFor` alone; sidecar prose at `Checkbox.usage.md:35` literally says "Wrap both in a `<label>`") is what teaches the defect.

**Alternatives considered**: Drop the native label entirely and rely on `aria-labelledby` (rejected — loses click-to-toggle, a real UX regression the spec-019 pattern deliberately avoids).

## D7 — Audit outcome: Select and Input need no change

**Decision**: Confirm-only. Neither teaches the broken pattern for a non-native control.

**Rationale**:
- **Select** (`Select.usage.md`: no native-label hits; `Select.tsx:159,192`): the trigger renders the selected value (`SelectValue`) as its text content, so it is named by content; the `htmlFor` Label it documents is supplementary. Out of the warning's scope per the clarify decision.
- **Input** (`Input.usage.md:30-38`, `Input.tsx:109`): a native `<input>`, which a `<label htmlFor>` names correctly. The file-input story already sets `aria-label: 'Upload file'` (`Input.stories.tsx:68`).

The audit task records this confirmation; if either turns out to teach a non-native-control native-label pattern on a closer read, correct it then.

## D8 — `Checkbox.tsx` becomes a client component

**Decision**: Add `'use client'` to `Checkbox.tsx` when the hook lands.

**Rationale**: `Checkbox.tsx` currently has no directive and no hooks (`Checkbox.tsx:1`); adding a `useEffect`-based hook requires the banner. Switch and Slider already carry it. Checkbox wraps a Base UI client primitive regardless, so this changes no rendered output — only the server/client boundary marker. Verify the spec-017 `'use client'` directive coverage (a unit test enumerating banners, if present) includes Checkbox after the change.

## D9 — Versioning

**Decision**: One patch changeset on `@unbranded-ds/react` covering the whole spec.

**Rationale**: The warning is the only runtime change, and it adds no public API or rendered DOM (dev-only). The doc corrections live in the same package. Patch is the right level per the clarify decision and Constitution X.
