---
"@unbranded-ds/tokens": minor
"@unbranded-ds/react": minor
---

Fix the destructive Button's contrast and ship the soft destructive treatment as a reusable token.

The Button's `destructive` variant rendered the destructive color as text on a translucent tint, which fell to about 4.1:1 in the light themes — below WCAG AA. It now paints a new canonical `destructive-subtle` surface with a darker `destructive-subtle-foreground`, authored to pass AA in every identity-by-scheme cell (all six) and surface-independent so it holds on cards and the page background alike.

A sixth declared contrast pair guards `destructive-subtle-foreground` on `destructive-subtle`, so a theme that drifts below 4.5:1 fails the build with a structured issue; the matrix test also checks the hover state. The pair is canonical and reusable, mirroring `muted`/`muted-foreground`, for any component that needs destructive content on a quiet surface.
