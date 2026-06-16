import type { ReactNode } from 'react';

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

function wrapper({ children }: { children: ReactNode }) {
	return <ThemeProvider>{children}</ThemeProvider>;
}

describe('useTheme', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-color-scheme');
		document.documentElement.removeAttribute('data-theme');
		document.documentElement.removeAttribute('data-density');
		// jsdom has no matchMedia; provide a benign light stub.
		window.matchMedia = ((query: string) =>
			({
				matches: false,
				media: query,
				addEventListener() {},
				removeEventListener() {},
			}) as unknown as MediaQueryList) as typeof window.matchMedia;
	});
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('throws THEME_NO_PROVIDER when called with no provider', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
		spy.mockRestore();
	});

	it('returns per-axis resolved/preference/available and a set()', () => {
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.resolved).toEqual({ colorScheme: 'light', theme: 'default', density: 'comfortable' });
		expect(result.current.available.theme).toContain('vaporwave');
		expect(result.current.available.density).toEqual(['comfortable', 'compact']);
		expect(typeof result.current.set).toBe('function');
	});

	it('set(partial) updates only the named axis', () => {
		const { result } = renderHook(() => useTheme(), { wrapper });
		act(() => {
			result.current.set({ density: 'compact' });
		});
		expect(result.current.resolved.density).toBe('compact');
		expect(result.current.resolved.colorScheme).toBe('light');
	});

	it('exposes a colorScheme convenience: resolved value plus a one-arg setter (spec 016)', () => {
		const { result } = renderHook(() => useTheme(), { wrapper });
		expect(result.current.colorScheme.resolved).toBe('light');
		expect(result.current.colorScheme.preference).toBe('light');
		act(() => {
			result.current.colorScheme.set('dark');
		});
		expect(result.current.colorScheme.resolved).toBe('dark');
		// the convenience is just a view over the axis map — both agree.
		expect(result.current.resolved.colorScheme).toBe('dark');
	});

	it('applies a forced value and refuses to change it', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const forcedWrapper = ({ children }: { children: ReactNode }) => (
			<ThemeProvider forced={{ density: 'compact' }}>{children}</ThemeProvider>
		);
		const { result } = renderHook(() => useTheme(), { wrapper: forcedWrapper });
		expect(result.current.resolved.density).toBe('compact');
		expect(result.current.forced.density).toBe('compact');
		act(() => {
			result.current.set({ density: 'comfortable' });
		});
		expect(result.current.resolved.density).toBe('compact');
		expect(spy).toHaveBeenCalledWith(
			'[unbranded-ds]',
			expect.objectContaining({ code: 'THEME_AXIS_FORCED' }),
		);
	});
});
