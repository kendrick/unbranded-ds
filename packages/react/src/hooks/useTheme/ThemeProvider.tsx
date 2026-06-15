/* eslint-disable react-refresh/only-export-components -- the ThemeStore context is co-located with its ThemeProvider, the only place it is created */
'use client';

import type { ThemeStore } from './themeStore';
import type { ThemeProviderProps } from './types';

import * as React from 'react';

import { createThemeStore } from './themeStore';

/**
 * Holds the {@link ThemeStore} for the subtree. `null` outside a provider, which
 * is how {@link useTheme} detects a missing ancestor and throws.
 */
export const ThemeStoreContext = React.createContext<ThemeStore | null>(null);

/**
 * The single source of truth for theme state, and the home for `defaults` and
 * `forced` configuration. Mirrors `next-themes`' provider: one wraps the app (or
 * a subtree). Every `useTheme()` below it reads one shared store, so sibling
 * controls never disagree.
 *
 * @remarks
 * Does not inject the first-paint bootstrap; the consumer still inlines
 * `themeBootstrapScript` from `@unbranded-ds/tokens/runtime` (spec 002). This
 * provider reconciles to storage on mount and never reads `window` during
 * render, so it is SSR-safe. Config (`defaults`, `forced`, `root`) is read once
 * when the store is created.
 *
 * @see {@link useTheme} for the per-axis API and the next-themes vocabulary mapping.
 */
export function ThemeProvider({
	children,
	defaults = {},
	forced = {},
	root,
}: ThemeProviderProps): React.JSX.Element {
	// One store per provider instance, created lazily so it is stable across
	// renders rather than recreated each time.
	const [store] = React.useState(() => createThemeStore({ defaults, forced, root }));

	return (
		<ThemeStoreContext.Provider value={store}>
			{children}
		</ThemeStoreContext.Provider>
	);
}
