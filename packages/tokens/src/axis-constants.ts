// Browser-safe axis constants. These used to live in axes.ts alongside the
// Node-only filesystem theme lister (`node:fs`), which meant importing the
// constants dragged `node:fs` into the type graph of any browser consumer (the
// react hook and toggles). They live here with no Node imports; axes.ts
// re-exports them so existing Node callers are unaffected. (spec 011)

export type Axis = 'aesthetic' | 'density';

export const AXES: readonly Axis[] = ['aesthetic', 'density'];

/** The DOM attribute each axis is applied through. */
export const AXIS_ATTRIBUTE: Record<Axis, string> = {
	aesthetic: 'data-theme',
	density: 'data-density',
};
