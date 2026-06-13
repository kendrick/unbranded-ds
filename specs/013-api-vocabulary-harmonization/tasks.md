# Tasks: API and vocabulary harmonization

**Input**: Design documents from `/specs/013-api-vocabulary-harmonization/`
**Prerequisites**: plan.md, spec.md, research.md (6 decisions), data-model.md, contracts/

**Tests**: Required. Renamed components re-run their existing unit + interaction + a11y suites unchanged (a rename moves names, not behavior); the deprecation path and the codemods get dedicated tests.

**Organization**: Discovery-gated. The audit (US1) is a HARD GATE: it produces the bounded rename list and must be reviewed before any rename starts. The post-audit rename stories (US2–US5) are therefore **templated by what the audit flags** rather than hard-enumerated; grounding suggests a short tail (the polymorphic `as`, with prop-vocab and slots already compliant). All component paths are under `packages/react/`.

## Format: `[ID] [P?] [Story] Description`

- **[P]** = parallelizable: a different file, no dependency on an incomplete task.
- Every rename task is **conditional on its audit entry existing and being approved** (US1). If the audit records a category compliant, that story is satisfied by the confirmation.

---

## Phase 1: Setup

- [X] T001 Confirm baseline green: `pnpm --filter @unbranded-ds/react test && pnpm typecheck && pnpm --filter @unbranded-ds/storybook build`.
- [ ] T002 Add `jscodeshift` (+ types) as a dev dependency and create `packages/react/codemods/` for the rename transforms.

---

## Phase 2: Foundational (the shared deprecation mechanism — blocks the rename stories)

**⚠️ Establish the pattern once so every rename applies it uniformly.**

- [ ] T003 Establish the deprecation-alias + structured-warn convention (per `contracts/deprecation-and-codemod.md`): a per-component shim accepts the old prop name, emits a structured `warn({ code: 'deprecated-prop', path, message })` via the existing `lib/warn.ts`, and lets the new name win when both are passed. Document the convention so each rename copies it; no audit dependency (the mechanism is generic).

**Checkpoint**: the deprecation mechanism + codemod scaffolding exist. The audit can begin.

---

## Phase 3: The discovery audit (US1 — the GATE) 🎯 MVP

**Goal**: The bounded list of every drift, reviewed and approved, before any rename.

**Independent Test**: `audit.md` covers every component (compliant or flagged); each flagged entry has a canonical (upstream-default) name, blast radius, codemod feasibility, and disposition. Approval is recorded before any rename lands.

- [X] T004 [US1] Produce the discovery audit at `specs/013-api-vocabulary-harmonization/audit.md` per `contracts/audit-format.md`: audit EVERY component for prop-vocabulary, slot, polymorphic, and prose-only-failure drift from the shared/upstream (shadcn/Base UI) vocabulary. Canonical names default to the upstream name; public slots already on shadcn (`Content`/`Trigger`/`Item`) are compliant; Base UI's internal `Popup`/`Positioner` are out of scope. Record compliant components as compliant. Run the audit prose through the `humanizer`. (Can fan out per-component, then converge.)
- [X] T005 [US1] Review and approve the audit; record approval. Resolve any conflict where one role is proposed different canonical names (FR-003). **This gate blocks every rename below** — Phase 4+ draws only from approved `flagged` entries.

**Checkpoint**: the rename scope is known and approved.

---

## Phase 4: Prop vocabulary (US2 — expected near-empty)

**Goal**: Any bespoke variant-axis prop the audit flagged uses shadcn's vocabulary (`variant`/`size`); intent stays folded into `variant`.

- [ ] T006 [US2] For each approved audit entry of `kind=prop`, rename to shadcn's vocabulary, add the deprecation alias (T003 pattern), move the sidecar/TSDoc/stories/tests in the same change, and add a codemod. **Grounding expects zero entries** (Button/Tabs/SegmentedControl already shadcn-flat, no `intent` prop); if so, this story is satisfied by the audit's compliant record.

**Checkpoint**: no bespoke variant-synonym remains; confirmed by the audit.

---

## Phase 5: Slot consistency (US3 — expected near-empty)

**Goal**: Every compound's PUBLIC slots follow shadcn's convention (which they already use).

- [ ] T007 [US3] For each approved audit entry of `kind=slot`, rename the public slot to shadcn's convention, with lockstep docs/tests and a codemod. Do NOT re-expose Base UI's internal `Popup`/`Positioner` as renamed public slots. **Grounding expects zero entries** (the compounds already expose `Content`/`Trigger`/`Item`); if so, the audit's compliant record satisfies the story.

**Checkpoint**: public slots follow shadcn; Base UI internals stay internal.

---

## Phase 6: Polymorphic prop unification (US4 — the real tail)

**Goal**: Render-as uses Base UI's `render` everywhere; `as` is the deprecated alias.

- [ ] T008 [P] [US4] In `Tooltip/Tooltip.tsx`: rename the `as` prop to `render` (or remove it in favor of Base UI's passthrough `render`), add the `as`→`render` deprecation alias (T003), and move `Tooltip.usage.md`, the TSDoc, the stories, and the tests in the same change.
- [ ] T009 [P] [US4] For each OTHER approved audit entry of `kind=polymorphic` (expected: VisuallyHidden, possibly SkipLink), apply the same `as`→`render` rename + alias + lockstep docs in that component's files.
- [ ] T010 [US4] Add the `as-to-render` jscodeshift transform in `codemods/as-to-render.ts` and a test asserting it rewrites `as=` to `render=` on a sample consumer snippet. (Depends on T008/T009 settling the rename.)

**Checkpoint**: `render` is the one polymorphic prop; `as` works only via the warned alias.

---

## Phase 7: Structured failure output (US5)

- [ ] T011 [US5] For each approved audit entry of `kind=failure`, route the prose-only warning or throw through `warn()`'s `{ code, path, message }` shape, keeping the human-readable string. Add a test asserting the structured payload. (The deprecation warnings from T003 already use this shape.)

**Checkpoint**: every flagged failure path is machine-parseable.

---

## Phase 8: Polish, migration & governance

- [ ] T012 Add the migration note to the changeset and `CHANGELOG`: every rename old→new, with the codemod command for the mechanical ones. Run the prose through the `humanizer`.
- [X] T013 Amend Constitution Section XI.2 to be compat-first (the shared vocabulary governs props/slots the design system introduces; props/slots inherited from a wrapped library follow the upstream name). Minor bump; update the Sync Impact Report. Run the prose through the `humanizer`.
- [X] T014 Full verification: `pnpm --filter @unbranded-ds/react test` (renamed components green; deprecation + codemod tests pass), `pnpm typecheck`, `pnpm --filter @unbranded-ds/react lint`, `pnpm --filter @unbranded-ds/storybook build && pnpm --filter @unbranded-ds/storybook test:storybook`. Grep for stale names: no in-repo doc/story/test references a renamed old name.
- [ ] T015 Add `.changeset/*.md`: `@unbranded-ds/react` minor (pre-1.0 breaking), referencing the migration note and the XI.2 amendment.

---

## Dependencies & Execution Order

### Phase order

**Setup (T001–T002) → Foundational (T003) → US1 audit + review (T004–T005, the GATE) → US2/US3/US4/US5 renames (T006–T011, scoped by the approved audit) → Polish (T012–T015).**

### Hard dependencies

- **T005 (audit approval) blocks every rename (T006–T011).** No rename starts before the audit is reviewed.
- T003 (the deprecation pattern) is reused by every rename.
- T010 (the codemod) depends on T008/T009 settling the rename.
- T012–T015 depend on all renames + the structured-failure pass.

### Parallel opportunities

- **The audit (T004)** can fan out per-component, then converge.
- **The rename tail (T008, T009)** is per-component and parallel — but small (grounding: mostly Tooltip).
- T006/T007 are expected to be no-ops (compliant), confirmed by the audit.

---

## Implementation Strategy

### MVP (US1 — the audit)

T001–T005. Ships the bounded, reviewed inventory of the library's XI.2/upstream compliance and its (short) rename tail. Independently valuable even if the renames slipped: it is the API-debt map no one has today, and grounding suggests it largely confirms compliance.

### Full delivery

1. Setup + the deprecation mechanism (T001–T003).
2. The audit + review gate (T004–T005).
3. The renames the audit approved (T006–T011), mostly the polymorphic tail.
4. Migration note + XI.2 amendment + verify (T012–T015).

### Notes

- **The audit gates everything.** Treat T005 as a hard stop; no rename before approval.
- **Upstream names win.** Never rename a prop/slot inherited unchanged from shadcn/Base UI; public slots already on shadcn stay.
- **Lockstep docs.** Every rename moves its sidecar + TSDoc + stories + tests in the same change (XI.3, FR-007).
- **Names, not semantics.** A rename must not change behavior; the existing suites pass unchanged.
- **The XI.2 amendment (T013) is the lasting change** — it writes the compat-first principle into the constitution.
- **All prose through the humanizer** (T004 audit, T012 migration note, T013 amendment).
