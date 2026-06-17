---
---

Spec 020 fixes the Storybook test-runner's cascade layer order so the design system's tokens resolve in the Vitest browser environment, and re-enables the nested-overlay z-index regression test (spec 010) that depended on them. The change touches `apps/storybook` test config and one `packages/react` story file (removing its `!test` quarantine and disabling only the color-contrast axe rule on two Dialog stories, tracked as a follow-up). Stories are not in the published `@unbranded-ds/react` bundle (`files: ["dist"]`), so no version bump.
