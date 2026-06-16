'use client';

import type { Axis } from '@unbranded-ds/tokens/client';

import type { AxisRecord, PartialAxisRecord } from './types';
import {
	AXES,

	AXIS_ATTRIBUTE,
	COLOR_SCHEME_PREFERENCE_STORAGE_KEY,
	COLOR_SCHEME_STORAGE_KEY,
	DENSITY_STORAGE_KEY,
	THEME_STORAGE_KEY,
	themesForAxis,
} from '@unbranded-ds/tokens/client';

import { warn } from '../../lib/warn';
import { THEME_AXIS_FORCED, THEME_INVALID_VALUE, THEME_NO_SYSTEM_SOURCE } from './errors';
import { resolvePreference } from './resolve';

// The OS media query each axis follows when its preference is `system`. Only the
// color-scheme axis has a signal (`prefers-color-scheme`); the theme/identity and
// density axes have none (spec 016 split `system` onto color scheme). A future
// axis with an OS source adds an entry here, and the rest of the store treats
// `system` as valid for it automatically.
const SYSTEM_MEDIA: Partial<Record<Axis, string>> = {
	colorScheme: '(prefers-color-scheme: dark)',
};

// System fallbacks, matching the bootstrap's literal defaults (spec 016).
const SYSTEM_DEFAULTS: AxisRecord = {
	colorScheme: 'light',
	theme: 'default',
	density: 'comfortable',
};

// The concrete-value storage key per axis. The color-scheme key is the one the
// bootstrap reads, so it must always hold a concrete value (never `system`).
const STORAGE_KEY: Record<Axis, string> = {
	colorScheme: COLOR_SCHEME_STORAGE_KEY,
	theme: THEME_STORAGE_KEY,
	density: DENSITY_STORAGE_KEY,
};

export interface ThemeStoreConfig {
	defaults: PartialAxisRecord;
	forced: PartialAxisRecord;
	root?: HTMLElement;
}

export interface ThemeSnapshot {
	preference: AxisRecord;
	resolved: AxisRecord;
	system: PartialAxisRecord;
}

export interface ThemeStore {
	subscribe: (onChange: () => void) => () => void;
	getSnapshot: () => ThemeSnapshot;
	getServerSnapshot: () => ThemeSnapshot;
	set: (partial: PartialAxisRecord) => void;
	forced: PartialAxisRecord;
}

function readStorage(key: string): string | null {
	try {
		return localStorage.getItem(key);
	}
	catch {
		// Storage can throw in private mode or with blocked cookies. Treat as absent.
		return null;
	}
}

function writeStorage(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	}
	catch {
		// Best-effort: a write failure must not break the page.
	}
}

function osValue(axis: Axis): string | undefined {
	const query = SYSTEM_MEDIA[axis];
	if (query == null || typeof window === 'undefined' || !window.matchMedia) {
		return undefined;
	}
	return window.matchMedia(query).matches ? 'dark' : 'light';
}

/**
 * Create the per-provider theme store. Holds the live per-axis state, owns the
 * localStorage projection and the `matchMedia` subscription, and exposes the
 * `useSyncExternalStore` triple plus `set`. SSR-safe: the server snapshot and
 * the first client snapshot are the same defaults-based object, so there is no
 * hydration mismatch; storage is read only after the first client subscribe.
 */
export function createThemeStore(config: ThemeStoreConfig): ThemeStore {
	const listeners = new Set<() => void>();
	const system: PartialAxisRecord = {};

	// Stated preference per axis, seeded from forced/defaults (SSR-safe, no
	// storage), reconciled with localStorage on the first client subscribe.
	const preference: AxisRecord = { ...SYSTEM_DEFAULTS };
	for (const axis of AXES) {
		const forced = config.forced[axis];
		preference[axis] = forced ?? config.defaults[axis] ?? SYSTEM_DEFAULTS[axis];
	}

	function computeResolved(): AxisRecord {
		const out: AxisRecord = { ...SYSTEM_DEFAULTS };
		for (const axis of AXES) {
			const pref = config.forced[axis] ?? preference[axis];
			out[axis] = resolvePreference(pref, system[axis]);
		}
		return out;
	}

	function buildSnapshot(): ThemeSnapshot {
		return {
			preference: { ...preference },
			resolved: computeResolved(),
			system: { ...system },
		};
	}

	// Cached snapshot: getSnapshot must return a stable reference until a real
	// change, or useSyncExternalStore loops. Server snapshot is frozen to the
	// initial value so server and first client render agree.
	let snapshot = buildSnapshot();
	const serverSnapshot = snapshot;

	function refreshSystem(): void {
		for (const axis of AXES) {
			if (SYSTEM_MEDIA[axis] != null) {
				system[axis] = osValue(axis);
			}
		}
	}

	function applyAttributes(): void {
		const root
			= config.root
				?? (typeof document === 'undefined' ? undefined : document.documentElement);
		if (root == null) {
			return;
		}
		for (const axis of AXES) {
			root.setAttribute(AXIS_ATTRIBUTE[axis], snapshot.resolved[axis]);
		}
	}

	function commit(): void {
		snapshot = buildSnapshot();
		applyAttributes();
	}

	function notify(): void {
		for (const listener of listeners) {
			listener();
		}
	}

	function reconcileFromStorage(): void {
		for (const axis of AXES) {
			const forced = config.forced[axis];
			if (forced != null) {
				preference[axis] = forced;
				continue;
			}
			if (SYSTEM_MEDIA[axis] != null) {
				// The companion key holds the stated intent (including `system`);
				// fall back to the concrete key, then the default.
				preference[axis]
					= readStorage(COLOR_SCHEME_PREFERENCE_STORAGE_KEY)
						?? readStorage(STORAGE_KEY[axis])
						?? config.defaults[axis]
						?? SYSTEM_DEFAULTS[axis];
			}
			else {
				preference[axis]
					= readStorage(STORAGE_KEY[axis])
						?? config.defaults[axis]
						?? SYSTEM_DEFAULTS[axis];
			}
		}
		refreshSystem();
		commit();
	}

	function onMediaChange(): void {
		refreshSystem();
		commit();
		notify();
	}

	let mql: MediaQueryList | undefined;
	function attachMedia(): void {
		const query = SYSTEM_MEDIA.colorScheme;
		if (mql == null && query != null && typeof window !== 'undefined' && window.matchMedia) {
			mql = window.matchMedia(query);
			mql.addEventListener('change', onMediaChange);
		}
	}
	function detachMedia(): void {
		if (mql != null) {
			mql.removeEventListener('change', onMediaChange);
			mql = undefined;
		}
	}

	function subscribe(onChange: () => void): () => void {
		const first = listeners.size === 0;
		listeners.add(onChange);
		if (first) {
			// First client subscriber (post-mount): reconcile with storage, then
			// follow the OS for any `system` axis.
			reconcileFromStorage();
			notify();
			attachMedia();
		}
		return () => {
			listeners.delete(onChange);
			if (listeners.size === 0) {
				detachMedia();
			}
		};
	}

	function set(partial: PartialAxisRecord): void {
		let changed = false;
		for (const axis of AXES) {
			const value = partial[axis];
			if (value == null) {
				continue;
			}

			const forced = config.forced[axis];
			if (forced != null) {
				warn({
					component: 'useTheme',
					issue: 'axis-forced',
					code: THEME_AXIS_FORCED,
					axis,
					value,
					forced,
				});
				continue;
			}

			const systemCapable = SYSTEM_MEDIA[axis] != null;
			if (value === 'system' && !systemCapable) {
				warn({
					component: 'useTheme',
					issue: 'no-system-source',
					code: THEME_NO_SYSTEM_SOURCE,
					axis,
					value,
				});
				continue;
			}

			const allowed = themesForAxis(axis);
			const valid = (systemCapable && value === 'system') || allowed.includes(value);
			if (!valid) {
				warn({
					component: 'useTheme',
					issue: 'invalid-value',
					code: THEME_INVALID_VALUE,
					axis,
					value,
					available: allowed,
				});
				continue;
			}

			preference[axis] = value;
			if (systemCapable) {
				// Persist the concrete resolved value to the bootstrap key (never
				// `system`) and the stated intent to the companion key.
				writeStorage(STORAGE_KEY[axis], resolvePreference(value, system[axis]));
				writeStorage(COLOR_SCHEME_PREFERENCE_STORAGE_KEY, value);
			}
			else {
				writeStorage(STORAGE_KEY[axis], value);
			}
			changed = true;
		}

		if (changed) {
			commit();
			notify();
		}
	}

	return {
		subscribe,
		getSnapshot: () => snapshot,
		getServerSnapshot: () => serverSnapshot,
		set,
		forced: config.forced,
	};
}
