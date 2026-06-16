import type { Axis } from '@unbranded-ds/tokens/client';
import type { ReactNode } from 'react';

/**
 * A per-axis map of values, keyed by the tokens `Axis` union (`colorScheme` |
 * `theme` | `density` since spec 016). A future axis adds a key here for free;
 * the hook is axis-agnostic.
 */
export type AxisRecord = Record<Axis, string>;

/** A partial per-axis map: used by `set()` and provider config, any subset. */
export type PartialAxisRecord = Partial<Record<Axis, string>>;

/**
 * The color-scheme convenience: the axis consumers reach for most. A flattened
 * view of the `colorScheme` slot of the axis maps, plus a one-arg setter, so the
 * common light/dark/system case skips the verbose `set({ colorScheme })`. The
 * axis maps stay the source of truth (spec 016 FR-012).
 */
export interface ColorSchemeConvenience {
	/** The applied color scheme (`light`/`dark`), with `'system'` already resolved. */
	resolved: string;
	/** The stated color-scheme preference; may be `'system'`. */
	preference: string;
	/** The OS color scheme (`light`/`dark`) where a signal exists. */
	system: string | undefined;
	/** Set the color scheme — shorthand for `set({ colorScheme })`. Accepts `'system'`. */
	set: (value: string) => void;
}

/**
 * The shape `useTheme()` returns. This is the multi-axis analog of next-themes'
 * single-value hook; the field-by-field mapping lives in the sidecar and TSDoc
 * (spec 011 FR-019/FR-020, three axes since spec 016).
 */
export interface UseThemeReturn {
	/** Stated choice per axis. The colorScheme axis may be `'system'`. */
	preference: AxisRecord;
	/** Applied value per axis, with `'system'` resolved to `light`/`dark`. */
	resolved: AxisRecord;
	/** OS value per axis where a signal exists (the colorScheme axis only). */
	system: PartialAxisRecord;
	/** Provider-pinned value per axis; an absent key is not forced. */
	forced: PartialAxisRecord;
	/** Allowed values per axis, from the tokens registry (incl. file-less defaults). */
	available: Record<Axis, string[]>;
	/** Set any subset of axes in one call. */
	set: (partial: PartialAxisRecord) => void;
	/** Convenience accessor + setter for the color-scheme axis (the common case). */
	colorScheme: ColorSchemeConvenience;
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
