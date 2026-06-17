# Contract: the Playwright suite

Runs against the production build (`next build` then `next start`). Functional assertions plus axe, no visual snapshots. Each spec maps to a requirement so a failure names a real experience.

| Spec        | Given / When / Then                                                                                                     | Covers              |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------- |
| renders     | Fresh load. Then the page shows design-system-styled content.                                                           | US1, SC-004         |
| no-flash    | Dark seeded in storage, reload. Then the document paints dark with no light frame before settling.                      | US2 #1, SC-002      |
| toggle      | Click light, system, dark. Then the theme changes live with no reload.                                                  | US2 #2, FR-005      |
| os-follow   | Set system, emulate the OS scheme flipping. Then the page follows.                                                      | US2 #3, FR-006      |
| composition | Open `/showcase`. Then vaporwave and compact are applied together via `forced`.                                         | US2 #5, FR-012      |
| components  | Home page. Then each demonstrated component is present and visible.                                                     | US4, FR-011         |
| responsive  | Viewport at 360px. Then there is no horizontal scroll, and the container-query demo's two instances render differently. | FR-015, SC-007      |
| persistence | Choose a theme and density, navigate to `/showcase` and back. Then both persist with no flash.                          | US2 #6, US5, FR-017 |
| a11y        | Run axe on `/` and `/showcase`. Then no serious or critical violations.                                                 | SC-009              |

Contract:

- The suite runs in CI in the `example-e2e` job and fails loudly on any regression (FR-016, SC-008).
- No-flash is asserted against production hydration timing, since dev-mode timing differs and would mask it. The assertion checks the resolved `data-theme` and computed background at first paint, with no intermediate light state.
- OS-follow uses Playwright's `emulateMedia({ colorScheme })` so it is deterministic.
- axe runs through `@axe-core/playwright` against the two key views.
