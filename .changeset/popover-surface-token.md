---
"@unbranded-ds/tokens": minor
"@unbranded-ds/react": patch
---

Define the popover surface token so Dialog, Tooltip, and Select content render on a real, opaque background.

The Dialog, Tooltip, and Select content components style themselves with `bg-popover` / `text-popover-foreground`, but the color schema never defined a `popover` token, so those surfaces resolved to unset CSS variables and rendered transparent. The accessibility gate then measured the Dialog description's muted-foreground text against the overlay showing through instead of a solid panel. That read 3.98:1, below the 4.5:1 floor for WCAG AA.

`popover` and `popover-foreground` are now canonical color tokens, authored per theme cell as a flat copy of that cell's `background` / `foreground`; elevation stays visual, from the components' ring and shadow. Because `muted-foreground` on `background` already passes AA, the description clears the threshold with no `muted-foreground` change. Two new declared contrast pairs guard `popover-foreground` / `popover` and `muted-foreground` / `popover` across all six identity-by-scheme cells, so a theme that omits the pair or drifts below 4.5:1 fails the build with a structured issue. The spec-020 color-contrast quarantine on the two Dialog stories is gone.
