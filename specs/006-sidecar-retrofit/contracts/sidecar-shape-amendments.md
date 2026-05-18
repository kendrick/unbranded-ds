# Contract amendments: Sidecar shape

**Base contract**: [specs/005-agent-experience-foundation/contracts/sidecar-shape.md](../../005-agent-experience-foundation/contracts/sidecar-shape.md)
**This amendment**: spec 006 (sidecar retrofit)
**Date**: 2026-05-18

## Purpose

Spec 005 ratified the sidecar shape and shipped the template plus CI validator. While planning the per-component retrofit, the /speckit.clarify session for spec 006 surfaced three places where the base contract was underspecified for implementation. Those gaps would otherwise have been resolved inconsistently across the 14 sidecar PRs. This document records the amendments that close them.

Each amendment is a narrowing of the base contract, not a divergence — every sidecar that conforms to this amendment also conforms to spec 005's contract. The base remains canonical for what sections appear and in what order.

## Amendment 1: Prop-table source-of-truth rule

**Base contract** (FR-019 in spec 005): "Sidecar prop tables agree with the component's TypeScript signatures and `argTypes` defaults (manual review)."

**Amendment**: When the TypeScript signature, the destructuring default in the implementation, and Storybook `argTypes` disagree, the resolution is:

- The TypeScript signature defines the `Type` column and the required-vs-optional designation
- The destructuring default in the component's `.tsx` implementation (e.g., `function Button({ size = 'md', ...props })`) defines the `Default` column
- Storybook `argTypes` is derivative. When `argTypes` disagrees with the code, the sidecar matches the code and the `argTypes` drift is recorded in `specs/006-sidecar-retrofit/spec-007-inbox.md` for spec 010 to resolve

**Why amend**: TypeScript interfaces and prop types literally cannot carry a default value — they can only mark a prop optional. The only place a runtime default actually lives is the destructuring assignment in the function body. The base contract's "TypeScript signatures and `argTypes` defaults" phrasing implies symmetry between two sources, but those sources answer different questions. This amendment names which source answers which question.

## Amendment 2: Compound-sidecar Props coverage depth

**Base contract**: Compound sidecars use "one subsection per slot," each with its own prop table.

**Amendment**: Each compound sidecar MUST contain a Props subsection for every named export the component exposes. Subsection length is proportional to consumer reach:

- **Core slots** — the named exports consumers compose directly (e.g., `Dialog.Trigger`, `Dialog.Content`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`, `Card`, `CardHeader`, `CardContent`) — get full prop tables with the `Type`, `Default`, and `Description` columns.
- **Escape-hatch slots** — the named exports rarely touched directly (e.g., `Dialog.Portal`, `Dialog.Overlay`, `Slider.Indicator` when optional, `DialogPortal`) — get a one-line subsection of the form:

  > Inherits all props from [underlying primitive]. Reach for this only when you need to [override scenario].

No named export is silently omitted. The discoverability rule is: a consumer searching for any exported identifier from the component lands somewhere in the sidecar's Props section.

**Why amend**: The base contract's "one subsection per slot" was ambiguous about whether "slot" meant "every named export" or "every concept a consumer mentally tracks." Some compound components export pieces that are technically public but rarely composed (`DialogPortal`), and the base contract didn't say whether those count. Equal-depth treatment produces sidecars padded with restatements of "passes through to Base UI"; omission leaves discoverability gaps. Proportional treatment is the calibrated middle.

## Amendment 3: Related section per-PR atomicity

**Base contract** (FR-015a in spec 005): "Sidecars include a Related section pointing at sibling components or related primitives when relevant; the section is omitted entirely when nothing relates."

**Amendment**: On the per-PR pass — the 14 component PRs that make up the bulk of this spec — Related links MUST point only at sidecars that are already merged to `main` at PR-author time. Never at peers that don't yet exist on `main`.

After all 14 per-component PRs land, a single "Related backfill" PR retroactively populates each sidecar's Related section to reach all relevant peers. The backfill PR ships its own `.changeset/sidecar-related-backfill.md` declaring `@unbranded-ds/react: patch`.

**Why amend**: The base contract didn't specify what happens when sidecar A wants to link to sidecar B and they're authored in different PRs. Two failure modes are real: temporary 404s on `main` if A merges with a link to B before B exists, or unbounded ordering constraints if A must wait for B. Forward-only authoring plus a backfill PR closes both: every merge leaves `main` internally consistent, and the cohort still parallelizes freely (14 PRs in any order, then one backfill).

## Compatibility with spec 005's contract

Every sidecar conforming to this amendment also conforms to spec 005's contract. Specifically:

- Amendment 1 narrows FR-019's "manual review" to a deterministic source-of-truth rule, but the cross-check still happens manually during PR review.
- Amendment 2 makes "one subsection per slot" specific without changing the structural rule that compound sidecars are one file with multiple subsections.
- Amendment 3 specifies the per-PR behavior of a section the base contract already described, without changing what the section's content looks like once filled in.

A future spec that retires this amendment would have to either fold it back into spec 005's contract (likely path) or supersede it with a different rule (e.g., automated agreement checking against generated component metadata, which would obsolete amendment 1's manual-review framing).

## What this amendment does NOT cover

- The section order, section names, or required-vs-optional status of any section in the base contract
- The `tsx`-block compile validation rule (the CI validator handles that unchanged)
- The Section XI.1 prose rules (humanizer, no three-item lists, no AI tells) — those apply to every sidecar identically
- Whether sidecars ship in the published npm package — separate decision, deferred
