# Research: Agent experience foundation

This document records the technical decisions made during planning for spec 005. The spec is fully clarified — 10 questions resolved during `/speckit.clarify`, recorded in spec.md's `## Clarifications` section. This file captures the implementation-level decisions that shape how those clarifications get realized.

## Decision: Use `@modelcontextprotocol/sdk` for the MCP server

**Decision**: Build the token-query MCP on Anthropic's official TypeScript SDK, `@modelcontextprotocol/sdk`. Use its stdio transport implementation.

**Rationale**:

- Official, maintained by the protocol owner. Tracks protocol updates without us reverse-engineering them.
- TypeScript-first. Plays well with the rest of the toolchain (strict mode, no `any`).
- The stdio transport is a thin wrapper around standard input/output handlers — we get protocol framing for free.
- Tool registration is declarative: define an input schema (Zod-compatible) and a handler, the SDK does the rest.

**Alternatives considered**:

- Custom MCP implementation from the protocol spec: rejected. The protocol is small but the framing details (JSON-RPC over stdio, capabilities negotiation, lifecycle handshakes) are easy to get wrong and not worth re-implementing for a v1.
- `mcp-typescript` (a community implementation): rejected. The official SDK is the canonical choice and avoids divergence.

## Decision: Section VIII PATCH amendment for the MCP SDK

**Decision**: Bundle a small constitution amendment in this spec that extends Section VIII's MCP entry to include `@modelcontextprotocol/sdk`. Bump 1.1.0 → 1.1.1 (PATCH).

**Rationale**:

- Section VIII is the locked toolchain list. New tools that operate at the workflow level (not just internal helpers) require amendment.
- `@modelcontextprotocol/sdk` is a workflow-level tool — it defines how MCP servers are built in this monorepo from here on.
- The precedent is spec 003's PATCH amendment that added `@changesets/cli` to Section VIII. Same shape, same rationale.

**Alternatives considered**:

- Skip the amendment and treat the SDK as an internal implementation detail: rejected. The SDK is referenced in code, in the build, and (indirectly) in `AGENTS.md`'s MCP configuration block. It's not internal.
- Defer the amendment to a separate constitution PR: rejected. Spec 003 set the precedent of bundling tool-list amendments with the spec that introduces the tool. Following that pattern keeps history coherent.

**Amendment text** (to be applied as part of this spec's work):

Replace the Section VIII MCP line:

```
- MCP: **`@storybook/addon-mcp`**, published remotely via Chromatic.
```

with:

```
- MCP: **`@storybook/addon-mcp`** (Storybook MCP, published remotely via Chromatic) and **`@modelcontextprotocol/sdk`** (used to build local stdio MCP servers — first instance: the token-query MCP on `@unbranded-ds/tokens`).
```

## Decision: MCP placement inside `@unbranded-ds/tokens`

**Decision**: The token-query MCP lives at `packages/tokens/src/mcp/`. The package's `bin` field gets a new entry that points at the built MCP server. Consumers invoke it via `npx @unbranded-ds/tokens mcp` or the equivalent MCP client configuration.

**Rationale**:

- Constitution Section I caps the repo at three packages. Adding a new package requires written justification. The MCP is small enough to live inside `@unbranded-ds/tokens` without bloating it.
- The MCP's data source IS `@unbranded-ds/tokens`. Co-location keeps the MCP and its data in lockstep — they version and publish together.
- The MCP SDK is a devDep on `@unbranded-ds/tokens` (or a regular dep if needed for the bin entry to resolve). It does not become a runtime dep for consumers who only import tokens.

**Alternatives considered**:

- New package `@unbranded-ds/tokens-mcp`: rejected per Section I. Adds publishing overhead, separate changesets, separate version, with no benefit while the MCP is small.
- Inside `apps/storybook` alongside the existing Storybook MCP: rejected. The token-query MCP has nothing to do with Storybook; bundling it there would be confusing.

## Decision: Build the MCP binary with `tsup`

**Decision**: The MCP server binary is built by the existing `tsup` step on `@unbranded-ds/tokens`. The build produces an ESM entry under `dist/mcp/server.js` that the `bin` field references with a shebang (`#!/usr/bin/env node`).

**Rationale**:

- `@unbranded-ds/tokens` already uses `tsup` for the rest of its build (Constitution Section VIII).
- A single build pipeline keeps publish behavior consistent — `pnpm changeset publish` ships the MCP alongside the tokens artifacts.
- `tsup` handles the shebang via its `banner` config.

**Alternatives considered**:

- Separate build for the MCP using `esbuild` directly: rejected. Adds a parallel build pipeline; `tsup` already wraps esbuild and gives the same output with less config.
- Publish the MCP as a TypeScript file run by `tsx` or `ts-node`: rejected. Slower startup, more runtime deps for the consumer.

## Decision: Reuse `validateTheme`'s WCAG math for `contrast`

**Decision**: The MCP's `contrast` tool calls the existing WCAG contrast function from `@unbranded-ds/tokens`. If that function is not exported, expose it as part of this spec's work.

**Rationale**:

- The tokens package already does WCAG contrast checking inside `validateTheme`. Re-implementing the math in the MCP creates a divergence risk.
- A single contrast function shared by the validator and the MCP ensures both produce the same answer for the same inputs.
- The function is small (luminance + ratio formula). Exposing it adds zero meaningful surface area to the public API.

**Alternatives considered**:

- Re-implement contrast in the MCP tool: rejected. Drift risk; duplication.
- Use a library like `color2k` or `chroma-js`: rejected. The math is ~30 lines and lives in the tokens package already; pulling a dep for it is overkill.

## Decision: `contrast` accepts color strings or token references

**Decision**: The `contrast` tool's input schema accepts each of its two color arguments as either a color string (hex `#rrggbb`, `rgb(...)`, or `hsl(...)`) or a named token reference (`color.primary`). When the input is a token reference, the tool resolves it against the active theme before computing contrast. Resolved as part of the `/speckit.clarify` session.

**Rationale**:

- Agents author components in token space, not color space. Forcing them to pre-resolve to hex defeats the MCP's purpose.
- Resolution is cheap — the tool already has access to the theme map.
- The dual input type is detectable at runtime (hex starts with `#`, rgb/hsl start with letters, token refs match `[a-z]+(\.[a-z0-9]+)+`).

**Alternatives considered**:

- Color strings only: rejected during clarify. Adds caller burden for no real win.
- Color strings, tokens, OR CSS variables (`var(--ds-color-primary)`): rejected during clarify. CSS variable resolution requires the runtime environment; the MCP doesn't have one.

## Decision: `palette` accepts flat OR hierarchical categories

**Decision**: The `palette` tool's `category` argument is a string that walks the token tree. `'color'` returns everything under `color.*`; `'color.foreground'` returns everything under `color.foreground.*`. Implementation walks the nested token object starting at the given prefix. Resolved as part of `/speckit.clarify`.

**Rationale**:

- Flat-only forces agents to filter client-side; hierarchical-only forces them to learn the structure first.
- Supporting both is one extra split-and-walk step in the implementation.

**Alternatives considered**:

- Flat only: rejected. Less ergonomic for callers who want to drill in.
- Hierarchical only: rejected. Discovery requires knowing the structure.

## Decision: Sidecar code blocks are compile-tested in CI

**Decision**: Sidecar markdown code blocks tagged `tsx` or `typescript` are extracted by a small homegrown script (`scripts/validate-sidecars.ts`) and run through `tsc --noEmit` in CI. The script lives at `scripts/` (not inside any package), runs as part of the verify job, and fails the build on any compile error in any sidecar. Resolved as part of `/speckit.clarify`.

**Rationale**:

- Sidecars promise consumers "the code shown works." Without compile-testing, sidecar examples can rot when component APIs change.
- A custom script gives us control over imports (each sidecar gets a temp `.tsx` file with `@unbranded-ds/react` imports resolved against the local workspace).
- No external dependency. The whole script is ~100 lines: read the markdown, regex out code blocks, write temp files, spawn `tsc`.

**Alternatives considered**:

- `mdsf` or other markdown-test runners: rejected. The known tools target inline snippets, not full TSX components, and we already have `tsc` in the toolchain.
- Couple sidecars to stories.tsx and extract examples from stories: rejected during clarify. Tight coupling, more maintenance, and sidecar code becomes constrained to what stories already render.

**Implementation note**: the script wraps each extracted code block in a minimal TSX scaffold (`import * as React from 'react'; import { Component } from '@unbranded-ds/react'; export default function _Example() { return ( <code-block-here /> ); }`) before passing to `tsc`. This gives the consumer's snippet a real compile environment without requiring authors to pad every example with imports.

## Decision: Sidecar code block tag is `tsx`

**Decision**: All sidecar code examples are tagged with the `tsx` language identifier in their markdown fence. The compile validator only inspects `tsx`-tagged blocks; other languages (e.g., `bash` for install commands) are ignored.

**Rationale**:

- Almost every example will include JSX (the components are React).
- `tsx` is the Prettier/highlight.js-standard identifier for TypeScript with JSX.
- Distinguishing `tsx` from `bash` blocks lets the validator skip non-TS content cleanly.

**Alternatives considered**:

- `typescript`: rejected. Implies no JSX, which would mislead authors.
- A custom marker like `tsx:sidecar`: rejected. Non-standard, breaks GitHub's syntax highlighting.

## Decision: AGENTS.md loosely follows the agents.md community convention

**Decision**: The repo-root `AGENTS.md` follows the spirit of the [agents.md](https://agents.md) community convention — a single root-level document instructing AI agents — but its content is tailored to this design system. We do not strictly conform to the convention's section list; we adopt the location and naming.

**Rationale**:

- agents.md is becoming a recognized convention; consumers who land on the repo with that expectation can read it.
- The convention's exact section list (project overview, dev setup, code conventions) is not a perfect fit for a design system whose primary agent-facing content is component sidecars and MCP endpoints.
- Spec FR-001 through FR-006 define this project's specific sections (MCP connection string, tool inventory, worked example, component index).

**Alternatives considered**:

- Strict agents.md conformance: rejected. Some required sections (e.g., dev commands) duplicate README.md content for no win.
- Bespoke name like `AGENT_GUIDE.md`: rejected. Loses the discoverability benefit of the convention.

## Decision: Sidecars are static markdown only (not rendered in Storybook for this spec)

**Decision**: For v1, sidecars are pure `.usage.md` files. They are not auto-rendered as Storybook MDX docs pages and not imported into stories.tsx as `parameters.docs.description.component` strings.

**Rationale**:

- Spec scope is already substantial. Adding a Storybook integration multiplies the deliverable.
- The autodoc audit (US3) already improves the in-Storybook docs surface for humans. Sidecars are the offline-readable surface for agents.
- A future spec can add a "sidecar as Storybook MDX" feature if the dual-rendering becomes desirable.

**Alternatives considered**:

- Render sidecars as MDX docs pages in Storybook: deferred to a future spec.
- Import sidecar prose into `parameters.docs.description.component`: deferred. Adds a build step (markdown → string import) that's not needed for v1.

## Decision: Sidecar authoring is manual per-component

**Decision**: The 14 component sidecars are authored manually by reading the existing stories, autodocs, and source. No code-generation step extracts an initial draft from the component for the author to edit.

**Rationale**:

- The sidecar's value is the consumer-facing prose (when-to-use, common patterns, accessibility narrative). Generation would skip the parts that matter and produce padding for the parts that don't.
- Manual authoring forces the author through Section XI.1's prose rules at write-time, which is when they're cheapest to apply.
- 14 components is bounded. A code-gen step would pay back at 100, not 14.

**Alternatives considered**:

- Generate skeleton sidecars from stories.tsx `argTypes`: rejected. Generated skeletons mislead authors into thinking the work is mostly done when the WHY content is still missing.
- Per-component LLM generation pass: rejected. The audit pass in US3 already operates on existing prose; bundling generation creates a coordination problem.

## Decision: Shared MCP runtime layout

**Decision**: Three internal modules at `packages/tokens/src/mcp/runtime/`:

- `stdio.ts` — thin wrapper around `@modelcontextprotocol/sdk`'s stdio transport that handles server creation, lifecycle, and tool registration. Exposes a single `createServer({ tools, name, version })` function.
- `errors.ts` — exports `mcpError(payload: { component: string; issue: string; [key: string]: unknown })` that wraps the structured warning shape from Section XI.4 / FR-034 inside the MCP protocol's error envelope.
- `testing.ts` — exports `spawnAndQuery(toolName, args)` for unit tests, and `runSmokeTest()` for the CI smoke job. Both wrap the lifecycle so tests don't reimplement subprocess plumbing.

**Rationale**:

- Each module has one job (transport, errors, testing helpers). Easy to lift out when a second MCP server consumes them.
- `createServer` is the obvious extension point — the future react MCP calls the same function with a different tools array.
- `mcpError` standardizes how errors look across all current and future tools.

**Alternatives considered**:

- A single `runtime.ts` file: rejected. Would couple transport, errors, and testing in one file; harder to reuse selectively.
- A separate `@unbranded-ds/mcp-runtime` package: rejected per Section I. Premature factoring before a second consumer exists.

## Decision: Per-tool tests use a thin in-process call pattern

**Decision**: Unit tests for each of the four MCP tools call the tool's handler function directly (in-process, with mocked input), not through the stdio transport. The smoke test alone spawns the subprocess and validates the protocol end-to-end.

**Rationale**:

- Per-tool tests cover business logic — clamping, error shapes, theme resolution. The stdio transport is irrelevant to that logic.
- In-process tests are fast (sub-millisecond) and easy to debug.
- Smoke test handles the protocol-level contract once for all tools.

**Alternatives considered**:

- Every test spawns the subprocess: rejected. Slow, brittle, harder to debug failures.
- Mock the SDK in unit tests: rejected. The SDK is the integration boundary; testing through a mocked SDK proves nothing.

## Decision: Sidecar PR pattern uses per-component changesets

**Decision**: Each of the 14 component sidecar PRs adds a `.changeset/add-<component>-sidecar.md` declaring `@unbranded-ds/react: patch`. This documents that the sidecar is shipped with the component's package.

**Rationale**:

- The Changesets workflow gates every PR that touches `packages/react/` on changeset presence. A sidecar-only PR is a `packages/react/` touch, so it needs a changeset.
- `patch` is the right level — sidecar additions are documentation, not behavior or API changes.
- Each PR's changeset gets consumed into the next `@unbranded-ds/react` release alongside any other patches.

**Alternatives considered**:

- One bulk changeset on the last sidecar PR: rejected. Fails the gate on every prior PR.
- Skip changesets entirely for sidecar PRs: rejected. The CI rule applies uniformly; carving out exceptions creates drift.
- Bundle into a single sidecar-retrofit PR (one changeset): rejected by FR-032 (one PR per component).

## Decision: Audit work organization

**Decision**: The autodoc audit (US3) runs as a focused pass after the sidecar template lands (US1) but does not depend on the sidecar retrofit (US2) completing. The audit can run in parallel with US2's per-component PRs.

**Rationale**:

- Audit work touches stories.tsx and `.tsx` source TSDoc. Sidecar work touches `.usage.md` files. Different files, no merge conflicts.
- Audit findings might inform sidecar prose (the audit cleans up the canonical autodoc descriptions, the sidecar then sources from them), but the audit's quality bar is independently checkable.

**Alternatives considered**:

- Audit blocks until all sidecars merge: rejected. Serialization for no benefit.
- Audit happens per-component alongside that component's sidecar PR: viable but conflates two concerns in one review.

## Decision: AGENTS.md links to per-component sidecars as the spec progresses

**Decision**: `AGENTS.md`'s component index includes a sidecar link for every shipped component. The links can land in `AGENTS.md` before every sidecar file exists; the link target works once the sidecar PR merges.

**Rationale**:

- `AGENTS.md` is one PR; sidecars are 14 PRs. Sequencing the AGENTS.md PR after all sidecars is over-coordinated.
- Markdown links to non-existent files don't break anything until clicked. The first sidecar PR validates a link works; subsequent PRs incrementally fill in the rest.
- The `AGENTS.md` PR can land first as part of US1's foundation work, with the index section noting "links populated as sidecars land."

**Alternatives considered**:

- AGENTS.md lands after all sidecars: rejected. Slow.
- AGENTS.md re-PR'd after every sidecar to keep the index current: rejected. Procedural overhead.
