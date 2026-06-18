---
'@unbranded-ds/tokens': patch
---

The token build now runs Prettier on the generated `defaults.generated.ts`, so it lands in the repo's single-quote style instead of raw JSON double quotes. `pnpm build` is idempotent again: it no longer leaves a dirty working tree, and the file stops flip-flopping between the build and a later `format` pass.
