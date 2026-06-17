import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('checkbox', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// The accessible-name guard warns on an unnamed control; capture it so the
		// suite stays quiet and the naming assertions below can inspect the calls.
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('renders with checkbox data-slot', () => {
		const { container } = render(<Checkbox aria-label="Accept" />);
		expect(container.querySelector('[data-slot=\'checkbox\']')).toBeInTheDocument();
	});

	it('applies styling classes via cn', () => {
		const { container } = render(<Checkbox aria-label="Accept" />);
		const checkbox = container.querySelector('[data-slot=\'checkbox\']')!;
		expect(checkbox.className).toContain('rounded');
		expect(checkbox.className).toContain('border');
	});

	it('merges consumer className', () => {
		const { container } = render(<Checkbox className="my-check" aria-label="Accept" />);
		const checkbox = container.querySelector('[data-slot=\'checkbox\']')!;
		expect(checkbox.className).toContain('my-check');
	});

	// Renders without StrictMode (RTL's default), so the dev double-invoke can't
	// turn "warns once" into a flaky assertion.
	describe('accessible-name warning', () => {
		it('warns once when rendered with no accessible name', async () => {
			render(<Checkbox />);
			await Promise.resolve();
			const nameWarnings = warnSpy.mock.calls.filter(
				([, payload]) => (payload as { issue?: string })?.issue === 'missing-accessible-name',
			);
			expect(nameWarnings).toHaveLength(1);
			expect(warnSpy).toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({ component: 'Checkbox', issue: 'missing-accessible-name' }),
			);
		});

		it('stays silent when given an aria-label', async () => {
			render(<Checkbox aria-label="Accept terms" />);
			await Promise.resolve();
			expect(warnSpy).not.toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({ issue: 'missing-accessible-name' }),
			);
		});

		it('stays silent when given an aria-labelledby', async () => {
			render(
				<>
					<span id="cb-label">Accept terms</span>
					<Checkbox aria-labelledby="cb-label" />
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
