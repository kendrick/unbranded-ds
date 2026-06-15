import { cleanup, fireEvent, render } from '@testing-library/react';
import { THEME_STORAGE_KEY } from '@unbranded-ds/tokens/runtime';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

function SchemeProbe() {
	const { resolved } = useTheme();
	return <span data-testid="scheme">{resolved.aesthetic}</span>;
}

describe('themeToggle', () => {
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

	it('renders three color-scheme segments with an accessible group name', () => {
		const { getByRole, getAllByRole } = render(
			<ThemeProvider>
				<ThemeToggle />
			</ThemeProvider>,
		);
		expect(getByRole('radiogroup', { name: 'Color scheme' })).toBeInTheDocument();
		expect(getAllByRole('radio')).toHaveLength(3);
	});

	it('routes a selection to set() and updates the applied scheme', () => {
		const { getByText, getByTestId } = render(
			<ThemeProvider>
				<ThemeToggle />
				<SchemeProbe />
			</ThemeProvider>,
		);
		fireEvent.click(getByText('Dark'));
		expect(getByTestId('scheme')).toHaveTextContent('dark');
	});

	it('shows no selection but stays enabled when the aesthetic value is brand/vaporwave', () => {
		localStorage.setItem(THEME_STORAGE_KEY, 'vaporwave');
		const { getByRole, getAllByRole } = render(
			<ThemeProvider>
				<ThemeToggle />
			</ThemeProvider>,
		);
		const checked = getAllByRole('radio').filter(
			(radio) => radio.getAttribute('aria-checked') === 'true',
		);
		expect(checked).toHaveLength(0);
		expect(getByRole('radiogroup').getAttribute('aria-disabled')).not.toBe('true');
	});

	it('renders disabled when the aesthetic axis is forced', () => {
		const { getByRole } = render(
			<ThemeProvider forced={{ aesthetic: 'dark' }}>
				<ThemeToggle />
			</ThemeProvider>,
		);
		expect(getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');
	});

	it('accepts custom labels', () => {
		const { getByText } = render(
			<ThemeProvider>
				<ThemeToggle labels={{ light: 'Día' }} />
			</ThemeProvider>,
		);
		expect(getByText('Día')).toBeInTheDocument();
	});
});
