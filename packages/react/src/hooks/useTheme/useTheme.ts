'use client';

import type { Axis } from '@unbranded-ds/tokens/client';

import type { UseThemeReturn } from './types';
import { AXES, themesForAxis } from '@unbranded-ds/tokens/client';
import * as React from 'react';

import { ThemeProviderError } from './errors';
import { ThemeStoreContext } from './ThemeProvider';

/**
 * Read and update the theme across every axis from one call: the multi-axis
 * analog of `next-themes`' `useTheme`. Must run inside a {@link ThemeProvider}.
 *
 * @remarks
 * If you know next-themes, the mapping is `theme` (the identity) to the `theme`
 * axis, `resolvedTheme` to `colorScheme.resolved`, `systemTheme` to
 * `colorScheme.system`, `forcedTheme` to `forced`, `themes` to `available`, and
 * `setTheme(value)` to `set(partial)` or the `colorScheme.set` shorthand. Ours are
 * per-axis maps keyed over the `Axis` union, plus a top-level `colorScheme`
 * convenience for the common light/dark/system case. The full table and the
 * rationale live in `useTheme.usage.md`.
 *
 * @throws {@link ThemeProviderError} (code `THEME_NO_PROVIDER`) when called with
 * no `<ThemeProvider>` ancestor.
 */
export function useTheme(): UseThemeReturn {
	const store = React.useContext(ThemeStoreContext);
	if (store == null) {
		throw new ThemeProviderError(
			'useTheme() must run inside a <ThemeProvider>. Wrap your app (or the subtree using theme controls) in <ThemeProvider>.',
		);
	}

	const snapshot = React.useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getServerSnapshot,
	);

	// `available` is non-reactive registry data (built-ins plus runtime
	// registrations), computed once at mount.
	const available = React.useMemo(() => {
		const out = {} as Record<Axis, string[]>;
		for (const axis of AXES) {
			out[axis] = themesForAxis(axis);
		}
		return out;
	}, []);

	// The color-scheme convenience setter is a thin shorthand over `set`; `store`
	// is stable, so it is too.
	const setColorScheme = React.useCallback(
		(value: string) => store.set({ colorScheme: value }),
		[store],
	);

	return {
		preference: snapshot.preference,
		resolved: snapshot.resolved,
		system: snapshot.system,
		forced: store.forced,
		available,
		set: store.set,
		colorScheme: {
			resolved: snapshot.resolved.colorScheme,
			preference: snapshot.preference.colorScheme,
			system: snapshot.system.colorScheme,
			set: setColorScheme,
		},
	};
}
