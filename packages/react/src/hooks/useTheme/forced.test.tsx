import { cleanup, fireEvent, render } from '@testing-library/react';
import { DENSITY_STORAGE_KEY } from '@unbranded-ds/tokens/client';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DensityToggle } from '../../components/DensityToggle';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

// End-to-end pinning (US4): the `forced` plumbing lives in the provider/store
// (US1) and AxisToggle (US2); this exercises the whole journey together.
function Harness() {
	const { resolved, forced, set } = useTheme();
	return (
		<div>
			<span data-testid="density">{resolved.density}</span>
			<span data-testid="forced">{String(forced.density)}</span>
			<button type="button" data-testid="try-set" onClick={() => set({ density: 'comfortable' })}>
				set comfortable
			</button>
		</div>
	);
}

describe('pin an axis (forced) end to end', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-density');
		window.matchMedia = ((query: string) =>
			({
				matches: false,
				media: query,
				addEventListener() {},
				removeEventListener() {},
			}) as unknown as MediaQueryList) as typeof window.matchMedia;
	});
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('forced value wins over storage, disables the toggle, and makes set() a structured no-op', () => {
		const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		// Storage holds a different value; the forced value must still win.
		localStorage.setItem(DENSITY_STORAGE_KEY, 'comfortable');

		const { getByTestId, getByRole } = render(
			<ThemeProvider forced={{ density: 'compact' }}>
				<DensityToggle />
				<Harness />
			</ThemeProvider>,
		);

		expect(getByTestId('density')).toHaveTextContent('compact');
		expect(getByTestId('forced')).toHaveTextContent('compact');
		expect(getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');

		fireEvent.click(getByTestId('try-set'));

		expect(getByTestId('density')).toHaveTextContent('compact');
		expect(warnSpy).toHaveBeenCalledWith(
			'[unbranded-ds]',
			expect.objectContaining({ code: 'THEME_AXIS_FORCED', axis: 'density' }),
		);
	});
});
