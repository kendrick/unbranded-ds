import {
	COLOR_SCHEME_PREFERENCE_STORAGE_KEY,
	COLOR_SCHEME_STORAGE_KEY,
	DENSITY_STORAGE_KEY,
	THEME_STORAGE_KEY,
} from '@unbranded-ds/tokens/runtime';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createThemeStore } from './themeStore';

type MediaHandler = (event: MediaQueryListEvent) => void;

// jsdom has no matchMedia, so install a controllable stub. Returns a handle to
// flip the OS value (firing `change`) and to count listener removals.
function installMatchMedia(dark: boolean) {
	const handlers = new Set<MediaHandler>();
	let matches = dark;
	let removeCount = 0;
	const mql = {
		get matches() {
			return matches;
		},
		media: '(prefers-color-scheme: dark)',
		addEventListener(_type: string, cb: MediaHandler) {
			handlers.add(cb);
		},
		removeEventListener(_type: string, cb: MediaHandler) {
			handlers.delete(cb);
			removeCount += 1;
		},
	};
	window.matchMedia = ((_query: string) =>
		mql as unknown as MediaQueryList) as typeof window.matchMedia;
	return {
		flip(next: boolean) {
			matches = next;
			for (const handler of handlers) {
				handler({ matches: next } as MediaQueryListEvent);
			}
		},
		removeCount: () => removeCount,
	};
}

describe('createThemeStore', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-color-scheme');
		document.documentElement.removeAttribute('data-theme');
		document.documentElement.removeAttribute('data-density');
		installMatchMedia(false);
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('server snapshot is the defaults and equals the first client snapshot (no hydration mismatch)', () => {
		const store = createThemeStore({ defaults: {}, forced: {} });
		const server = store.getServerSnapshot();
		expect(server.resolved).toEqual({ colorScheme: 'light', theme: 'default', density: 'comfortable' });
		expect(store.getSnapshot()).toBe(server);
	});

	it('honors provider defaults before storage loads', () => {
		const store = createThemeStore({ defaults: { colorScheme: 'dark' }, forced: {} });
		expect(store.getServerSnapshot().resolved.colorScheme).toBe('dark');
	});

	it('reconciles per-axis localStorage on the first subscribe and applies all three attributes', () => {
		localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'dark');
		localStorage.setItem(THEME_STORAGE_KEY, 'brand');
		localStorage.setItem(DENSITY_STORAGE_KEY, 'compact');
		const store = createThemeStore({ defaults: {}, forced: {} });
		store.subscribe(() => {});
		expect(store.getSnapshot().resolved).toEqual({ colorScheme: 'dark', theme: 'brand', density: 'compact' });
		expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark');
		expect(document.documentElement.getAttribute('data-theme')).toBe('brand');
		expect(document.documentElement.getAttribute('data-density')).toBe('compact');
	});

	it('re-enters `system` from the companion key, resolves against the OS, and follows OS changes without writing storage', () => {
		const mm = installMatchMedia(true);
		localStorage.setItem(COLOR_SCHEME_PREFERENCE_STORAGE_KEY, 'system');
		localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, 'light');
		const store = createThemeStore({ defaults: {}, forced: {} });
		store.subscribe(() => {});
		expect(store.getSnapshot().preference.colorScheme).toBe('system');
		expect(store.getSnapshot().resolved.colorScheme).toBe('dark');

		localStorage.removeItem(COLOR_SCHEME_STORAGE_KEY);
		mm.flip(false);
		expect(store.getSnapshot().resolved.colorScheme).toBe('light');
		expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBeNull();
	});

	it('removes the media listener when the last subscriber leaves', () => {
		const mm = installMatchMedia(false);
		localStorage.setItem(COLOR_SCHEME_PREFERENCE_STORAGE_KEY, 'system');
		const store = createThemeStore({ defaults: {}, forced: {} });
		const unsubscribe = store.subscribe(() => {});
		unsubscribe();
		expect(mm.removeCount()).toBe(1);
	});

	it('set() persists only the named axis', () => {
		const store = createThemeStore({ defaults: {}, forced: {} });
		store.subscribe(() => {});
		store.set({ density: 'compact' });
		expect(localStorage.getItem(DENSITY_STORAGE_KEY)).toBe('compact');
		expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBeNull();
		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
		expect(store.getSnapshot().resolved.density).toBe('compact');
	});

	it('persists the identity axis to its own key, independent of color scheme', () => {
		const store = createThemeStore({ defaults: {}, forced: {} });
		store.subscribe(() => {});
		store.set({ theme: 'vaporwave' });
		expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('vaporwave');
		expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBeNull();
		expect(store.getSnapshot().resolved.theme).toBe('vaporwave');
	});

	it('set(system) writes a concrete value to the bootstrap key and `system` to the companion key', () => {
		installMatchMedia(true);
		const store = createThemeStore({ defaults: {}, forced: {} });
		store.subscribe(() => {});
		store.set({ colorScheme: 'system' });
		expect(localStorage.getItem(COLOR_SCHEME_PREFERENCE_STORAGE_KEY)).toBe('system');
		expect(localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)).toBe('dark');
	});

	it('warns and no-ops a set() on a forced axis (THEME_AXIS_FORCED)', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const store = createThemeStore({ defaults: {}, forced: { density: 'compact' } });
		store.subscribe(() => {});
		store.set({ density: 'comfortable' });
		expect(store.getSnapshot().resolved.density).toBe('compact');
		expect(spy).toHaveBeenCalledWith(
			'[unbranded-ds]',
			expect.objectContaining({ code: 'THEME_AXIS_FORCED', axis: 'density' }),
		);
	});

	it('warns on an invalid value and on `system` for a no-signal axis', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const store = createThemeStore({ defaults: {}, forced: {} });
		store.subscribe(() => {});
		store.set({ colorScheme: 'not-a-scheme' });
		store.set({ theme: 'system' });
		const codes = spy.mock.calls.map((call) => (call[1] as { code?: string }).code);
		expect(codes).toContain('THEME_INVALID_VALUE');
		expect(codes).toContain('THEME_NO_SYSTEM_SOURCE');
	});
});
