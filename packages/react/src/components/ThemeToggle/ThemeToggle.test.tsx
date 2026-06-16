import { cleanup, fireEvent, render } from '@testing-library/react';
import { themesForAxis } from '@unbranded-ds/tokens/client';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

function IdentityProbe() {
	const { resolved } = useTheme();
	return <span data-testid="identity">{resolved.theme}</span>;
}

describe('themeToggle (identity)', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
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

	it('renders one segment per available identity, data-driven from the registry', () => {
		const { getAllByRole, getByText } = render(
			<ThemeProvider>
				<ThemeToggle />
			</ThemeProvider>,
		);
		expect(getAllByRole('radio')).toHaveLength(themesForAxis('theme').length);
		expect(getByText('Default')).toBeInTheDocument();
		expect(getByText('Brand')).toBeInTheDocument();
		expect(getByText('Vaporwave')).toBeInTheDocument();
	});

	it('has no system segment (identity has no OS signal)', () => {
		const { queryByText } = render(
			<ThemeProvider>
				<ThemeToggle />
			</ThemeProvider>,
		);
		expect(queryByText('System')).toBeNull();
	});

	it('routes a selection to set() and updates the applied identity', () => {
		const { getByText, getByTestId } = render(
			<ThemeProvider>
				<ThemeToggle />
				<IdentityProbe />
			</ThemeProvider>,
		);
		fireEvent.click(getByText('Brand'));
		expect(getByTestId('identity')).toHaveTextContent('brand');
	});

	it('renders disabled when the theme axis is forced', () => {
		const { getByRole } = render(
			<ThemeProvider forced={{ theme: 'brand' }}>
				<ThemeToggle />
			</ThemeProvider>,
		);
		expect(getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');
	});

	it('exposes an accessible group name', () => {
		const { getByRole } = render(
			<ThemeProvider>
				<ThemeToggle />
			</ThemeProvider>,
		);
		expect(getByRole('radiogroup', { name: 'Theme' })).toBeInTheDocument();
	});
});
