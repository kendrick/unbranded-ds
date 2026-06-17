# Phase 0 Research: Storybook interaction and accessibility gate executes in CI

The clarification session settled the structural choices (own CI job, default rendering, fix-in-PR). This records the mechanism decisions and the dependency facts found in the repo.

## Decision: run the gate with `storybookTest()` in Vitest browser mode

**Decision**: Define the `storybook` Vitest project with `@storybook/addon-vitest`'s `storybookTest()` plugin, in browser mode via the Playwright provider (Chromium, headless), reusing the existing `.storybook/vitest.setup.ts` as `setupFiles`.

**Rationale**: This is the mandated Storybook Test addon (Constitution VIII), already a devDep. It discovers stories from `.storybook/main.ts`, runs each story's `play` function, and runs the `@storybook/addon-a11y` axe pass — both layers in one invocation. Browser mode is the part that matters for accessibility: axe can only compute `color-contrast` against a real rendered surface, which is why the brief and the clarification both insist on it. The `test:storybook` script (`vitest run --project storybook`) already exists and only fails because no config defines that project.

**Alternatives considered**:

- The older `@storybook/test-runner` (Jest + Playwright against a built, served Storybook) — rejected. The repo already adopted `@storybook/addon-vitest`, the Vitest-native path, and the test-runner would need a separately built and served Storybook.
- jsdom or happy-dom — rejected. Neither computes color-contrast, so the accessibility promise would be hollow.

## Decision: stay on Vitest 3

**Decision**: Keep Vitest at 3 and add `@vitest/browser@^3`. Do not move to Vitest 4.

**Rationale**: The repo's unit tests run on Vitest 3.2.4. `@storybook/addon-vitest@10.3`'s peer range is `@vitest/browser: ^3.0.0 || ^4.0.0`, so version 3 is supported. Moving to Vitest 4 (and its separate `@vitest/browser-playwright` provider package) would churn the existing unit projects for no benefit to this feature.

**Alternatives considered**:

- Bump the workspace to Vitest 4 — rejected as out-of-scope churn that touches the passing unit suite.

## Decision: add `@vitest/browser` and `playwright` to the Storybook app

**Decision**: Add `@vitest/browser` (^3) and `playwright` as dev dependencies of `apps/storybook`. The CI job installs the browser with `playwright install --with-deps chromium`.

**Rationale**: `@vitest/browser` is the optional peer `addon-vitest` needs for browser mode, and it is currently absent from the workspace (no `.pnpm/@vitest+browser*`). `playwright` provides both the Vitest browser provider and the `playwright install` binary; `playwright@1.61.0` is already in the workspace store (pulled by the example's `@playwright/test`), so resolution is cheap. `apps/storybook` is private, so this is a dev-dependency change with no changeset implication.

**Alternatives considered**:

- The WebdriverIO provider — rejected. Playwright matches the `example-e2e` job and is already present.

## Decision: a dedicated CI job that needs `verify`

**Decision**: Add a `storybook-test` job to `ci.yml`, `needs: verify`, parallel to `example-e2e`. It checks out, installs, builds `@unbranded-ds/tokens` + `@unbranded-ds/react`, installs Chromium, and runs `pnpm --filter @unbranded-ds/storybook test:storybook`.

**Rationale**: The clarification chose a separate job so the Chromium install stays off the `verify` path that gates every PR. The shape mirrors `example-e2e`, which already proves the browser-install pattern works in this CI. Gating on `verify` avoids spending browser minutes on a PR that already fails the cheap checks. The workflow stays one `ci.yml` with a job graph, satisfying Section VIII's "one workflow, one job graph."

**Alternatives considered**:

- A step inside `verify` — rejected by the clarification: it serializes the browser install into the common path and slows every PR.
- An independent job not gated on `verify` — rejected: it would run the expensive browser job even when the cheap checks have already failed.

## Decision: build tokens and react before the gate

**Decision**: The job builds `@unbranded-ds/tokens` and `@unbranded-ds/react` before running the gate.

**Rationale**: `.storybook/preview.ts` imports built theme CSS (`@unbranded-ds/tokens/themes/*.css`), and stories resolve `@unbranded-ds/react`. The `verify` job already builds before it builds Storybook, which confirms the build-first requirement. Building only the two packages the Storybook depends on keeps the job lean.

**Alternatives considered**:

- Run against source with no build — rejected. The theme CSS files are build outputs; without them the stories render unstyled and contrast checks are meaningless.

## Decision: default rendering, and keep the existing a11y threshold

**Decision**: The gate checks each story in its default rendering (default-light, per `initialGlobals` in `preview.ts`). Keep `a11y: { test: 'error' }` unchanged.

**Rationale**: The cross-axis contrast guarantee across all six color-scheme/theme/density cells is already covered by `themes-contrast.test.ts`, a fast tokens unit test. Rendering every story across all cells would duplicate that test and multiply runtime for little gain, since a component's ARIA and structure do not change across themes — only colors do, and colors are matrix-tested at the token level. `test: 'error'` fails on any axe violation, which is stricter than the constitution's serious/critical floor and therefore still compliant.

**Alternatives considered**:

- Render the full axis matrix per story — rejected by the clarification: duplicative and slow.
- Scope the failing threshold to serious/critical now — deferred. Only worth doing if a low-impact violation proves noisy in practice; the stricter default is the safer starting point.

## No `preview.ts` change expected

The existing `.storybook/vitest.setup.ts` already calls `setProjectAnnotations([previewAnnotations.default])`, which wires the decorators and the a11y parameter into the test context. The new `vitest.config.ts` reuses it as `setupFiles`. If the project turns out to need an annotation the setup file lacks, that is a contained test-config tweak, still within the CI/test-config scope.
