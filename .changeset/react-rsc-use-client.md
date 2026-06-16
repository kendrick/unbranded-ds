---
"@unbranded-ds/react": patch
---

The published bundle now declares itself a client module, so React Server Component consumers (Next.js App Router) can import a component without their own `'use client'` boundary. The components have always been client components — they use hooks — but the bundle never said so, so importing one into a server component pulled client code into the server graph and broke the build. A tsup banner adds the directive. No public API change: same exports, same props, same behavior.
