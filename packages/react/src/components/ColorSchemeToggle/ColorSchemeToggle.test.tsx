import { cleanup, fireEvent, render } from '@testing-library/react';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from '../../hooks/useTheme';
import { ColorSchemeToggle } from './ColorSchemeToggle';

function SchemeProbe() {
	const { resolved } = useTheme();
	return <span data-testid="scheme">{resolved.colorScheme}</span>;
}

describe('colorSchemeToggle', () => {
	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-color-scheme');
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

	it('renders three color-scheme segments with an accessible group name', () => {
		const { getByRole, getAllByRole } = render(
			<ThemeProvider>
				<ColorSchemeToggle />
			</ThemeProvider>,
		);
		expect(getByRole('radiogroup', { name: 'Color scheme' })).toBeInTheDocument();
		expect(getAllByRole('radio')).toHaveLength(3);
	});

	it('routes a selection to set() and updates the applied scheme', () => {
		const { getByText, getByTestId } = render(
			<ThemeProvider>
				<ColorSchemeToggle />
				<SchemeProbe />
			</ThemeProvider>,
		);
		fireEvent.click(getByText('Dark'));
		expect(getByTestId('scheme')).toHaveTextContent('dark');
	});

	it('drives only the color-scheme axis, leaving the identity untouched', () => {
		// The split (spec 016) means a color-scheme selection never overwrites the
		// theme/identity axis — they ride independent attributes.
		function IdentityProbe() {
			const { resolved } = useTheme();
			return <span data-testid="identity">{resolved.theme}</span>;
		}
		const { getByText, getByTestId } = render(
			<ThemeProvider defaults={{ theme: 'brand' }}>
				<ColorSchemeToggle />
				<IdentityProbe />
			</ThemeProvider>,
		);
		fireEvent.click(getByText('Dark'));
		expect(getByTestId('identity')).toHaveTextContent('brand');
	});

	it('renders disabled when the color-scheme axis is forced', () => {
		const { getByRole } = render(
			<ThemeProvider forced={{ colorScheme: 'dark' }}>
				<ColorSchemeToggle />
			</ThemeProvider>,
		);
		expect(getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');
	});

	it('accepts custom labels', () => {
		const { getByText } = render(
			<ThemeProvider>
				<ColorSchemeToggle labels={{ light: 'Día' }} />
			</ThemeProvider>,
		);
		expect(getByText('Día')).toBeInTheDocument();
	});
});
