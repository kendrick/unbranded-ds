import { cleanup, fireEvent, render } from '@testing-library/react';
import { themesForAxis } from '@unbranded-ds/tokens/client';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from '../../hooks/useTheme';
import { DensityToggle } from './DensityToggle';

function DensityProbe() {
	const { resolved } = useTheme();
	return <span data-testid="density">{resolved.density}</span>;
}

describe('densityToggle', () => {
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

	it('renders one segment per available density value, data-driven from the registry', () => {
		const { getAllByRole, getByText } = render(
			<ThemeProvider>
				<DensityToggle />
			</ThemeProvider>,
		);
		expect(getAllByRole('radio')).toHaveLength(themesForAxis('density').length);
		expect(getByText('Comfortable')).toBeInTheDocument();
		expect(getByText('Compact')).toBeInTheDocument();
	});

	it('has no system segment', () => {
		const { queryByText } = render(
			<ThemeProvider>
				<DensityToggle />
			</ThemeProvider>,
		);
		expect(queryByText('System')).toBeNull();
	});

	it('routes a selection to set() and updates the applied density', () => {
		const { getByText, getByTestId } = render(
			<ThemeProvider>
				<DensityToggle />
				<DensityProbe />
			</ThemeProvider>,
		);
		fireEvent.click(getByText('Compact'));
		expect(getByTestId('density')).toHaveTextContent('compact');
	});

	it('renders disabled when the density axis is forced', () => {
		const { getByRole } = render(
			<ThemeProvider forced={{ density: 'compact' }}>
				<DensityToggle />
			</ThemeProvider>,
		);
		expect(getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');
	});

	it('exposes an accessible group name', () => {
		const { getByRole } = render(
			<ThemeProvider>
				<DensityToggle />
			</ThemeProvider>,
		);
		expect(getByRole('radiogroup', { name: 'Density' })).toBeInTheDocument();
	});
});
