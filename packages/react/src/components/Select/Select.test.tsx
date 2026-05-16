import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Select, SelectTrigger, SelectValue } from './Select';

describe('select', () => {
	it('renders trigger with correct data-slot', () => {
		const { container } = render(
			<Select>
				<SelectTrigger>
					<SelectValue>Pick one</SelectValue>
				</SelectTrigger>
			</Select>,
		);

		expect(container.querySelector('[data-slot=\'select-trigger\']')).toBeInTheDocument();
	});

	it('applies styling classes on trigger via cn', () => {
		const { container } = render(
			<Select>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
			</Select>,
		);

		const trigger = container.querySelector('[data-slot=\'select-trigger\']')!;
		expect(trigger.className).toContain('border');
		expect(trigger.className).toContain('rounded');
	});
});
