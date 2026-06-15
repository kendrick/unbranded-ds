import type { Axis } from '@unbranded-ds/tokens/client';
import type { ReactNode } from 'react';

/**
 * A per-axis map of values, keyed by the tokens `Axis` union (`aesthetic` |
 * `density` today). A future axis (e.g. a split-out color-scheme axis, spec 011
 * FR-009) adds a key here for free; the hook is axis-agnostic.
 */
export type AxisRecord = Record<Axis, string>;

/** A partial per-axis map: used by `set()` and provider config, any subset. */
export type PartialAxisRecord = Partial<Record<Axis, string>>;

/**
 * The shape `useTheme()` returns. This is the multi-axis analog of next-themes'
 * single-value hook; the field-by-field mapping lives in the sidecar and TSDoc
 * (spec 011 FR-019/FR-020).
 */
export interface UseThemeReturn {
	/** Stated choice per axis. The aesthetic axis may be `'system'`. */
	preference: AxisRecord;
	/** Applied value per axis, with `'system'` resolved to `light`/`dark`. */
	resolved: AxisRecord;
	/** OS value per axis where a signal exists (the aesthetic axis only, today). */
	system: PartialAxisRecord;
	/** Provider-pinned value per axis; an absent key is not forced. */
	forced: PartialAxisRecord;
	/** Allowed values per axis, from the tokens registry (incl. file-less defaults). */
	available: Record<Axis, string[]>;
	/** Set any subset of axes in one call. */
	set: (partial: PartialAxisRecord) => void;
}

/** Props for `<ThemeProvider>`. */
export interface ThemeProviderProps {
	children: ReactNode;
	/** Per-axis starting value, used until storage loads; falls back to tokens defaults. */
	defaults?: PartialAxisRecord;
	/** Per-axis pinned value: applied, overrides storage, and cannot change via `set()`. */
	forced?: PartialAxisRecord;
	/** Element the `data-*` attributes are written to. Defaults to `document.documentElement`. */
	root?: HTMLElement;
}
