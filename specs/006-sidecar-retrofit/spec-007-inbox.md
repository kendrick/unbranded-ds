# Spec-007 inbox

Observed TSDoc/JSDoc drift collected during the sidecar-retrofit pass (spec 006). Spec 007 owns resolution. Authors append here; do not modify the source `.tsx` files in sidecar PRs.

---

- `packages/react/src/components/Button/Button.stories.tsx:13-18` — `argTypes` for `size` lists only `['default', 'xs', 'sm', 'lg', 'icon']` but the CVA definition in `Button.tsx` includes `'icon-xs'`, `'icon-sm'`, and `'icon-lg'` as valid size values. The stories control panel silently omits those three options. Observed while authoring `Button.usage.md`.

- `packages/react/src/components/Dialog/Dialog.tsx:43-48` — `DialogContent`'s `showCloseButton` prop (a component-specific addition on top of `DialogPrimitive.Popup.Props`) has no JSDoc comment. Its purpose and default are clear from the implementation but not from the type alone. Observed while authoring `Dialog.usage.md`.

- `packages/react/src/components/Dialog/Dialog.tsx:92-98` — `DialogFooter`'s `showCloseButton` prop has no JSDoc comment. The prop's relationship to `DialogContent`'s same-named prop (they serve opposite defaults and render in different positions) warrants a comment explaining when you'd use one versus the other. Observed while authoring `Dialog.usage.md`.

- `packages/react/src/components/Slider/Slider.tsx:92-106` — `SliderControlProps`, `SliderTrackProps`, `SliderIndicatorProps`, and `SliderThumbProps` interfaces have no property-level TSDoc. `SliderRootProps` properties are also undocumented at the interface level; descriptions live only in Storybook `argTypes`. Observed while authoring `Slider.usage.md`.

- `packages/react/src/components/Slider/Slider.tsx:255-293` — `SliderControl`, `SliderTrack`, `SliderIndicator`, and `SliderThumb` function declarations carry no JSDoc comment describing their role in the slot composition contract. Observed while authoring `Slider.usage.md`.

- `packages/react/src/components/SegmentedControl/SegmentedControl.tsx:67-83` — `SegmentedControlRootProps` and `SegmentedControlItemProps` interfaces have no property-level TSDoc comments; prop descriptions live only in Storybook `argTypes`. Observed while authoring `SegmentedControl.usage.md`.
