import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Tooltip } from './Tooltip';

describe('tooltip', () => {
	it('renders the provider and trigger with data-slot attributes', () => {
		const { container } = render(
			<Tooltip.Provider>
				<Tooltip.Trigger>Trigger</Tooltip.Trigger>
				<Tooltip.Content>Content</Tooltip.Content>
			</Tooltip.Provider>,
		);

		expect(container.querySelector('[data-slot=\'tooltip-provider\']')).toBeInTheDocument();
		expect(container.querySelector('[data-slot=\'tooltip-trigger\']')).toBeInTheDocument();
	});

	it('renders a <button> when asChild is omitted', () => {
		const { container } = render(
			<Tooltip.Provider>
				<Tooltip.Trigger>Trigger</Tooltip.Trigger>
				<Tooltip.Content>Content</Tooltip.Content>
			</Tooltip.Provider>,
		);

		const trigger = container.querySelector('[data-slot=\'tooltip-trigger\']');
		expect(trigger?.tagName).toBe('BUTTON');
	});

	it('asChild preserves the child element type instead of injecting a button', () => {
		// US1 scenario 5: the citation pattern with <sup><a>...</a></sup> must
		// keep the anchor tag so the original DOM and screen-reader semantics
		// survive the wrapping.
		const { container } = render(
			<Tooltip.Provider>
				<Tooltip.Trigger asChild>
					<a href="#source" data-testid="citation-link">
						[1]
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content>Source</Tooltip.Content>
			</Tooltip.Provider>,
		);

		const link = container.querySelector('[data-testid=\'citation-link\']');
		expect(link).not.toBeNull();
		expect(link?.tagName).toBe('A');
		expect(container.querySelector('button')).toBeNull();
	});

	it('asChild forwards the data-slot to the rendered child element', () => {
		const { container } = render(
			<Tooltip.Provider>
				<Tooltip.Trigger asChild>
					<a href="#anchor" data-testid="link">
						[1]
					</a>
				</Tooltip.Trigger>
				<Tooltip.Content>Tip</Tooltip.Content>
			</Tooltip.Provider>,
		);

		const link = container.querySelector('[data-testid=\'link\']');
		expect(link?.getAttribute('data-slot')).toBe('tooltip-trigger');
	});

	it('merges className from wrapper into the rendered trigger button', () => {
		const { container } = render(
			<Tooltip.Provider>
				<Tooltip.Trigger className="my-trigger">Trigger</Tooltip.Trigger>
				<Tooltip.Content>Content</Tooltip.Content>
			</Tooltip.Provider>,
		);

		const trigger = container.querySelector('[data-slot=\'tooltip-trigger\']');
		expect(trigger?.className).toContain('my-trigger');
	});

	it('exposes the compound shape with Provider, Trigger, and Content', () => {
		expect(typeof Tooltip.Provider).toBe('function');
		expect(typeof Tooltip.Trigger).toBe('function');
		expect(typeof Tooltip.Content).toBe('function');
	});

	it('accepts custom delayDuration without throwing', () => {
		// Default is 700ms; this also exercises the path where consumers
		// override the delay. The actual delay timing is Base UI's
		// responsibility — we just confirm the prop is accepted at the
		// wrapper boundary.
		expect(() =>
			render(
				<Tooltip.Provider delayDuration={150}>
					<Tooltip.Trigger>Trigger</Tooltip.Trigger>
					<Tooltip.Content>Content</Tooltip.Content>
				</Tooltip.Provider>,
			),
		).not.toThrow();
	});

	it('accepts custom side and align on Content without throwing', () => {
		// Defaults are 'top' and 'center' per the contract. Confirming all
		// other documented values pass typecheck and render gives us safety
		// against breaking the prop surface.
		const sides = ['top', 'right', 'bottom', 'left'] as const;
		const aligns = ['start', 'center', 'end'] as const;

		for (const side of sides) {
			for (const align of aligns) {
				expect(() =>
					render(
						<Tooltip.Provider>
							<Tooltip.Trigger>Trigger</Tooltip.Trigger>
							<Tooltip.Content side={side} align={align}>
								Content
							</Tooltip.Content>
						</Tooltip.Provider>,
					),
				).not.toThrow();
			}
		}
	});
});
