# Feature Specification: Nested-overlay stacking regression runs in the Storybook test-runner

**Feature Branch**: `020-storybook-zindex-test-env`
**Created**: 2026-06-16
**Status**: Draft
**Input**: User description: "@docs/workshops/2026-06-16/spec-020-storybook-zindex-test-env.md"

## Clarifications

### Session 2026-06-16

- Q: How should US2's "the gate fails if stacking is inverted" guarantee be realized — a permanent committed test or a one-time check? → A: A one-time manual verification during development (invert the stops, confirm the gate goes red, revert). The re-enabled story assertion is the only shipped gate; the z-index token ordering it relies on is already guarded permanently by the tokens' `defaults.test.ts`.
- Q: Is resolving the whole z-index token category (FR-006 / US3) a verified requirement or an expected side effect of the one fix? → A: An expected side effect. The tooltip/dialog story stays the only required gate; no separate test is added for the other `z-(--z-index-*)` consumers.
- Q: Where must the test environment source the resolved z-index values from? → A: The generated token build output only — the same artifacts the dev and production Storybook consume — with no test-only copy of the values that could drift from the real tokens.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The nested-overlay stacking guarantee is gated again (Priority: P1)

Spec 010 fixed a real bug: a tooltip opened inside an open dialog used to share a flat `z-50` with the dialog, so its position in the stack was undefined and it could render behind the dialog it belongs to. The `TooltipStacksAboveDialog` story is the regression test for that fix — it opens the dialog, hovers the tooltip, and asserts the tooltip's resolved z-index sits above the dialog's. When spec 019 stood up the test-runner gate, this one story had to be quarantined with `tags: ['!test']` because the z-index custom properties came back unresolved in the runner, so the assertion threw on every run. This story removes the quarantine and makes the assertion execute and pass, so the stacking guarantee has a live gate instead of a story everyone trusts by eye.

**Why this priority**: This is the whole point of the spec. The regression test exists, the bug it guards against is real, and right now the test is opted out of the only place it would ever run automatically. A silent return of the spec-010 bug would sail through CI green. Closing that hole is the headline value; everything else supports it.

**Independent Test**: Remove the `!test` tag, run the gate, and confirm `TooltipStacksAboveDialog` appears in the run and passes rather than being skipped or throwing on `NaN`.

**Acceptance Scenarios**:

1. **Given** the test-runner gate from spec 019, **When** it runs on a pull request, **Then** `TooltipStacksAboveDialog` executes (it is no longer skipped) and its stacking assertion passes.
2. **Given** the re-enabled story, **When** the assertion reads each element's computed z-index, **Then** both reads return their numeric token stops, not `auto`.
3. **Given** the quarantine tag is gone, **When** a contributor lists the suite's skipped stories, **Then** this story is no longer among them.

---

### User Story 2 - The gate actually discriminates a regression (Priority: P2)

The assertion in this story never ran successfully before — it was written alongside the spec-010 fix, but the runner that would execute it did not exist until spec 019, and then the story was quarantined. So re-enabling it carries a specific risk: a test that has never executed can pass for the wrong reason. If both z-index reads still failed to resolve, both would be `NaN`, and an author skimming a green run might assume the guarantee holds when the check is really inert. This story proves the re-enabled assertion is a true gate by confirming, once and by hand during development, that it goes red when the stacking order is broken. That confirmation is a development-time check, not a committed always-failing test; the token ordering it leans on (tooltip stop above overlay stop) is already guarded permanently by the tokens' `defaults.test.ts`.

**Why this priority**: It is the honesty check on US1. Re-enabling a test is worth little if the test cannot fail; the spec-010 protection is only real if a regression turns the gate red. It is P2 rather than P1 because it builds on the re-enabled story from US1, and the two land together.

**Independent Test**: Locally break the stacking order — swap it so the dialog's stop is at or above the tooltip's — run the gate, and confirm it fails and names this story. Restore it and the gate passes.

**Acceptance Scenarios**:

1. **Given** the re-enabled story, **When** the stacking order is inverted so the tooltip no longer sits above the dialog, **Then** the gate fails and the output names the failing story.
2. **Given** the re-enabled story under correct stacking, **When** the gate runs, **Then** it passes because the tooltip's resolved stop is genuinely greater than the dialog's, not because both are absent or equal.

---

### User Story 3 - Token-driven stacking resolves for future stories too (Priority: P3)

The reason the assertion failed was not specific to the tooltip and the dialog. The color tokens resolve in the runner because the preview imports the theme CSS files directly, so the `--color-*` properties reach the cascade as plain CSS. The z-index stops arrive a different way, through the Tailwind preset, and the runner's build did not surface them — so every `z-(--z-index-*)` usage fell back to `auto`, not just these two. Other components already lean on the same stops: the skip link sits at `--z-index-max`, the select popover at `--z-index-popover`. This story makes the z-index stops resolve in the test environment as a category, so the next stacking assertion a contributor writes does not rediscover this wall.

**Why this priority**: It turns a one-story repair into a durable fix, but the spec ships its core value once US1 passes. The generalization costs nothing extra — the same fix that surfaces the tooltip and overlay stops surfaces all of them — so it is an expected side effect rather than separate work, and it is NOT separately gated: the tooltip/dialog story stays the only required assertion, with no new test added for the skip link or the select. P3 because no current story beyond `TooltipStacksAboveDialog` asserts on these values yet.

**Independent Test**: As an optional manual spot-check (not a committed test), read the computed z-index of an element that uses any other `z-(--z-index-*)` stop in the runner — the skip link or the select popover, say — and confirm it returns the numeric stop rather than `auto`.

**Acceptance Scenarios**:

1. **Given** the test environment after this fix, **When** any rendered story references a `--z-index-*` stop, **Then** `getComputedStyle` resolves it to its numeric value rather than `auto`.

---

### Edge Cases

- **The assertion passes for the wrong reason**: if the fix surfaced the properties but at the wrong values, the ordering check could pass or fail by accident. The guard is US2 — the gate must fail when stacking is inverted — so a pass means the tooltip stop genuinely resolved above the dialog stop, not that both landed on the same number or both stayed unresolved.
- **A theme redefines the z-index stops**: the assertion checks an ordering invariant (tooltip above overlay), not the absolute numbers 60 and 50. A theme that scaled the stops differently still satisfies the test as long as the tooltip stop stays above the overlay stop, which is the actual guarantee.
- **The full Storybook build already renders correctly**: the stacking works in the dev server and the production build today — only the runner's build dropped the variables. The fix must not change how the stops resolve in those environments; it only adds what the runner was missing.
- **Re-quarantining to force green is out of bounds**: the fix may not silence the story again, exclude the failing rule, or edit the components or token values to manufacture a pass. The story must run and pass on its own merits, because a manufactured pass would defeat the spec-010 protection it exists to provide.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `--z-index-*` custom properties MUST resolve to their token values in the Storybook test-runner environment, so a component that references a `z-(--z-index-*)` stop reports that numeric value through `getComputedStyle().zIndex` rather than `auto`.
- **FR-002**: The `TooltipStacksAboveDialog` story MUST run in the test-runner with its `!test` exclusion removed, and its assertion MUST pass, confirming the tooltip's resolved stop sits above the dialog's.
- **FR-003**: The re-enabled assertion MUST be capable of failing when the stacking order regresses, so the gate is a real check rather than a no-op that passes because both reads are absent or equal. This discriminating power is verified once, by manually inverting the stops during development, not by committing an always-failing test; the token-ordering invariant it depends on is guarded permanently by the tokens' `defaults.test.ts`.
- **FR-004**: The fix MUST be confined to the test environment and test configuration. It MUST NOT change the z-index token values, the Dialog or Tooltip components, or the stacking behavior — those are correct and are exactly what the test guards.
- **FR-005**: The fix MUST NOT alter how the z-index stops resolve in the full Storybook dev server or the production build; those already render the stacking correctly and MUST continue to.
- **FR-006**: Resolving the z-index stops MUST apply to the whole category, not a tooltip-and-overlay special case, so every `z-(--z-index-*)` consumer in the test environment computes its real value and a later stacking assertion does not re-encounter the `auto` fallback. This is satisfied by construction by the same fix and is NOT separately gated — the tooltip/dialog story remains the only required assertion.
- **FR-007**: A failing run MUST name the offending story and the assertion that broke, so a contributor or an agent can act on it without first reproducing the failure locally (Constitution XI).
- **FR-008**: The z-index values the test environment resolves MUST come from the generated token build output, the same artifacts the dev and production Storybook consume, and the fix MUST NOT introduce a test-only declaration of the stops. A hand-authored copy could drift from the real tokens and let the assertion pass against stale values.
- **FR-009**: Surfacing the z-index stops in the test environment MUST NOT change the result of any currently-passing story's interaction or accessibility checks. The stops already resolve in dev and production, so making the runner match that should leave every other story's outcome unchanged; a story whose result does change is a real finding to triage, not something to suppress.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `TooltipStacksAboveDialog` executes in the test-runner gate — it appears in the run rather than being skipped — and passes.
- **SC-002**: A one-time manual inversion of the stacking order during development makes the gate fail and name the story, confirming the assertion discriminates a regression. This inversion is a development-time check, reverted before merge, not a committed test.
- **SC-003**: In the runner, the tooltip and dialog content resolve to distinct, ordered z-index values (the tooltip's stop above the dialog's, 60 above 50 under the default theme) rather than the unresolved `auto` fallback.
- **SC-004**: The number of stories carrying the `!test` quarantine tag drops by one, and no story is newly quarantined to make the suite pass.
- **SC-005**: The change set touches only test environment, test configuration, and the one story's quarantine tag — the z-index token values, the Dialog and Tooltip components, and the full build's rendering are unchanged.
- **SC-006**: No test-only copy of the z-index values is introduced; the test environment resolves the stops from the generated token build output, so the values it asserts against cannot drift from the real tokens.
- **SC-007**: Every story that passed the gate before this change still passes after it; surfacing the z-index stops changes no other story's interaction or accessibility result.

## Assumptions

- Spec 019 is merged, so the test-runner gate exists and this story already lives inside it, quarantined. This spec re-enables one assertion within that gate rather than standing up new test infrastructure.
- The stacking itself is correct in production (spec 010 fixed it), so once the z-index stops resolve in the runner the assertion passes with no change to the components or tokens. The gap was always the test environment, never the behavior.
- The assertion checks the ordering invariant (tooltip stop above overlay stop) rather than the literal numbers, so it stays valid across themes that set different absolute z-index values.
- An empty changeset is required, but no version bump. Removing the `!test` tag edits a file under `packages/react/src/`, which `changeset-check.yml` detects (it gates any `^packages/(tokens|react)/` diff), so a `.changeset/*.md` must be present. Stories are not in the published bundle (`files: ["dist"]`), so the changeset carries empty frontmatter and bumps nothing — the same pattern spec 019 used in `.changeset/storybook-test-runner-gate.md`.
- The capability to surface the custom properties is available in the test stack spec 019 already introduced; no new product dependency is added to fix this.
- The single fix that resolves the tooltip and overlay stops also resolves the other `z-(--z-index-*)` consumers, so US3 needs no work beyond what US1 requires, and that generalization is intentionally left unverified rather than gated by a new test.
- A generated token CSS artifact that already carries the `--z-index-*` custom properties exists in the tokens build output, so the test environment can resolve the stops from it without a hand-authored copy.

> **Implementation correction (2026-06-16):** The brief's premise that "colors resolve in the test, only z-index doesn't" turned out to be wrong. The runner applied no design system token styling at all — a cascade layer-order bug shadowed every token, so the a11y gate had been scoring contrast against unstyled components. The fix is a test-only layer-order declaration; it also made the gate compute real contrast for the first time, surfacing a genuine `muted-foreground` contrast failure and undefined `--color-popover` tokens, now tracked in `docs/workshops/2026-06-16/spec-022-popover-tokens-and-dialog-contrast.md`. See `research.md` → Resolution for the full account.
