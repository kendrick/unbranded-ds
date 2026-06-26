---
'@unbranded-ds/react': patch
---

Drop the redundant quotes inside the icon size-guard (`[&_svg:not([class*=size-])]`) on Button, Tabs, Select, and SegmentedControl. The quoted form escaped into the generated CSS as `[class*=\'size-\']`, which Tailwind's CSS optimizer couldn't parse and flagged on every build. Unquoted, the selector matches the same elements, so component rendering is unchanged.
