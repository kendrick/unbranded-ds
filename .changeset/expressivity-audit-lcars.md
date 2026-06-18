---
'@unbranded-ds/tokens': patch
---

Add the LCARS expressivity-fixture identity under `themes/theme/lcars/`, built and AA-validated through the same pipeline as the shipped themes so the fixture corpus and its a11y guard are real. It stays out of the browser registry and `listThemes` on purpose, a fixture for stressing the design system rather than a registered product theme. Existing themes, the schema, and the exports are unchanged.
