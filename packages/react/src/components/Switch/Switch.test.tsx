import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

describe('switch', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// The accessible-name guard warns on an unnamed control; capture it so the
		// suite stays quiet and the naming assertions below can inspect the calls.
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders with switch and thumb data-slots', () => {
		const { container } = render(<Switch aria-label="Airplane mode" />);
		expect(container.querySelector('[data-slot=\'switch\']')).toBeInTheDocument();
		expect(container.querySelector('[data-slot=\'switch-thumb\']')).toBeInTheDocument();
	});

	it('applies styling classes via cn', () => {
		const { container } = render(<Switch aria-label="Airplane mode" />);
		const sw = container.querySelector('[data-slot=\'switch\']')!;
		expect(sw.className).toContain('inline-flex');
	});

	it('merges consumer className', () => {
		const { container } = render(<Switch className="my-switch" aria-label="Airplane mode" />);
		const sw = container.querySelector('[data-slot=\'switch\']')!;
		expect(sw.className).toContain('my-switch');
	});

	// Renders without StrictMode (RTL's default), so the dev double-invoke can't
	// turn "warns once" into a flaky assertion.
	describe('accessible-name warning', () => {
		it('warns once when rendered with no accessible name', async () => {
			render(<Switch />);
			await Promise.resolve();
			const nameWarnings = warnSpy.mock.calls.filter(
				([, payload]) => (payload as { issue?: string })?.issue === 'missing-accessible-name',
			);
			expect(nameWarnings).toHaveLength(1);
			expect(warnSpy).toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({ component: 'Switch', issue: 'missing-accessible-name' }),
			);
		});

		it('stays silent when given an aria-label', async () => {
			render(<Switch aria-label="Airplane mode" />);
			await Promise.resolve();
			expect(warnSpy).not.toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({ issue: 'missing-accessible-name' }),
			);
		});

		it('stays silent when given an aria-labelledby', async () => {
			render(
				<>
					<span id="sw-label">Airplane mode</span>
					<Switch aria-labelledby="sw-label" />
				</>,
			);
			await Promise.resolve();
			expect(warnSpy).not.toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({ issue: 'missing-accessible-name' }),
			);
		});
	});
});
