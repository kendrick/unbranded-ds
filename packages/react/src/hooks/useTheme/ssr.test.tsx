import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

function Probe() {
	const { resolved } = useTheme();
	return <span>{`${resolved.aesthetic}/${resolved.density}`}</span>;
}

describe('useTheme SSR safety (Constitution §IX bullet 6)', () => {
	it('renders the provider and a useTheme consumer server-side without throwing', () => {
		expect(() =>
			renderToString(
				<ThemeProvider>
					<Probe />
				</ThemeProvider>,
			),
		).not.toThrow();
	});

	it('emits the defaults during the server render; reconciliation waits for mount', () => {
		const html = renderToString(
			<ThemeProvider>
				<Probe />
			</ThemeProvider>,
		);
		expect(html).toContain('light/comfortable');
	});
});
