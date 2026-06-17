---
---

Spec 019 wires the Storybook interaction and accessibility test-runner into CI (a change to `apps/storybook` and the workflow, not the published packages). The accompanying `packages/react` edits are story-only accessibility fixes — they are not part of the published `@unbranded-ds/react` bundle (`files: ["dist"]`), so no version bump.
