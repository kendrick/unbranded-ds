I read the feedback against the current state of the packages. Verified what's there ([packages/tokens/src/schema.ts](packages/tokens/src/schema.ts), [packages/react/package.json](packages/react/package.json), [packages/tokens/package.json](packages/tokens/package.json), [THEMING.md](THEMING.md)). Here's my take, item by item.

## Top picks (do these)

**G.1 — bundle Tailwind wiring into `@unbranded-ds/react/preset.css`.** The strongest item in the doc, and they sold it correctly:

- Layering argument is right: `@source` is a framework concern; it belongs in the React package, not tokens.
- The "why not collapse to one line" rebuttal is right: importing Tailwind from inside the DS preset couples us to a Tailwind major.
- The "registration-only `@theme inline` preserves overrides" point is critical and we must not regress it — verified at [packages/tokens/dist/tailwind/preset.css:1-20](packages/tokens/dist/tailwind/preset.css). Default values live in `tokens-{light,dark,brand}.css`, separate from the preset. Keep them separate.
- Concrete diff: add `"./preset.css"` exports to both packages, ship a 2-line wrapper in `@unbranded-ds/react`. ~30 min of work, ten-minutes-of-pain saved for every consumer.

**A.3 + C.3 — ship `themeBootstrapScript` from `@unbranded-ds/tokens/runtime`.** Small, high-leverage. Note: the feedback says FOUC pattern isn't documented; it actually is at [THEMING.md:132-145](THEMING.md#L132-L145). But the existing version is copy-paste and consumers will drift. Exporting a stringified IIFE is cleaner. One harmonization: the existing snippet uses `ds-theme` as the localStorage key, the feedback's example uses `theme` — pick one (I'd vote `ds-theme` to avoid collision with consumer apps).

**B.2 — motion tokens.** Real schema gap (none today, confirmed [packages/tokens/src/schema.ts:1-93](packages/tokens/src/schema.ts)). The Material/HIG-aligned set they propose is conservative and right. New token category — clean addition. Adopt.

**A.4 — `.sr-only` Tailwind utility.** Tiny. Add to the preset. The component form can wait.

## Worth doing, with modifications

**A.2 — `<ThemeToggle>`.** The pattern is real but the proposed component bakes in localStorage key, document.documentElement, and a specific UX (3-state segmented). For an "unbranded" DS that's a lot of opinion. Counter-proposal: ship the two underlying primitives — `<SegmentedControl>` (also covers D's roadmap) and a `useTheme()` hook — and let consumers compose `<ThemeToggle>` in 20 lines. They get the value without us committing to a UX.

**B.1 — `font-serif` token.** One-line schema change, agreed, but since `themeSchema` requires every token, adding it is a breaking change to existing consumer themes. Two ways: (a) add as required and bump to 0.2.0 (we're pre-1.0, this is fine), or (b) make the typography object's font keys partial. I'd do (a) — cleaner.

**B.3 — type scale beyond `xl`.** Yes to `2xl` and `3xl` as required additions. Display sizes (`display-sm`/`display`/`display-lg`/`display-xl`) feel stylistic — defer until a component (`<Heading>`?) needs them as a contract.

**D — missing primitives.** All legitimate. My priority order, slightly different from theirs:

1. **Tooltip** (Base UI primitive, common, low-spec)
2. **Skip link** (a11y staple, ~10 lines)
3. **Slider** (real demand, more design surface)
4. **SegmentedControl** (pairs with A.2)
5. **Toast** — defer; semantics + portaling + queueing is a chunk of work
6. **Form** — defer; depends on whether we want field-level error patterns

**E.1 — `examples/nextjs-15-app-router/`.** Worth doing once G.1 lands, because then the example is genuinely short (2 lines of CSS wiring vs 3). Doing it before G.1 would document the soon-to-be-obsolete path.

## Lighter touch / smaller items

**C.2 — schema-extension worked example.** Yes, one section in THEMING.md showing how to add `motion` end-to-end (JSON → SD config → dist → Tailwind utility). Pairs naturally with shipping B.2.

**C.4 — `validateTheme()` invocation context.** Yes, small recipe in THEMING.md. Recommended pattern: a Vitest test in your project's suite. Cheap doc fix.

**C.5 — per-component docs.** Storybook is the source of truth and we already have Chromatic publishing wired in CI. Solution: link the published Storybook URL from both READMEs once it exists. Skip the README prop tables — they'll rot.

**F.1 — token naming rationale.** One-line note in README. Free.

**F.2 — oklch vs hex.** Already covered at [THEMING.md:73](THEMING.md#L73). Feedback is wrong here; no action.

**C.6 — `publishConfig.access` reminder.** Already correct in [packages/tokens/package.json:42-44](packages/tokens/package.json#L42-L44). Their 404 was probably the npm registry's first-publish cache, not our config. Skip.

## Defer / decline

**A.1 `<VariableText>`.** Cool, but niche. Variable-font axis animation is one museum project, not a broad pattern. Costs us a framer-motion dep (or rolling our own `useReducedMotion`). No.

**B.4 density / touch-target tokens.** They agree it's lower priority. Defer.

**E.2 MCP-for-agents doc.** Worth a short addition to [apps/storybook/README.md](apps/storybook/README.md), but the agent-side use case is still speculative. A paragraph in the existing README, not a new doc.

**G.2 — mirror clean paths to future framework packages.** N/A until `@unbranded-ds/vue` exists. Note the pattern, move on.

**G.3 — wildcard exports.** Keep them through 0.x, exactly as they suggest. Revisit at 1.0.

## Suggested sequencing

If you want to PR this in waves rather than one bolus:

1. **G.1 + A.3 + A.4** (one PR — the consumer-DX win). Two-line wiring + bootstrap helper + sr-only utility.
2. **B.2 + B.3 + C.2** (one PR — schema growth + the worked example that explains how to grow it). Bump to 0.2.0.
3. **B.1** (small PR — `font-serif`, ride the 0.2.0 bump).
4. **D primitives** (one PR per component: Tooltip → Skip link → Slider → SegmentedControl).
5. **A.2** (compose ThemeToggle on top of SegmentedControl + useTheme, after D's segmented control lands).
6. **E.1 example app** (last, after G.1 + at least one primitive PR).

The top three lines of that list are where >70% of the value sits. The rest is grind that pays off once a second consumer shows up.
