import { fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Slider } from './Slider';

function renderSingle(props: Parameters<typeof Slider.Root>[0] = { children: null }) {
	return render(
		<Slider.Root {...props}>
			<Slider.Control>
				<Slider.Track>
					<Slider.Indicator />
				</Slider.Track>
				<Slider.Thumb />
			</Slider.Control>
		</Slider.Root>,
	);
}

function renderRange(
	props: Parameters<typeof Slider.Root>[0] = { children: null },
) {
	return render(
		<Slider.Root {...props}>
			<Slider.Control>
				<Slider.Track>
					<Slider.Indicator />
				</Slider.Track>
				<Slider.Thumb />
				<Slider.Thumb />
			</Slider.Control>
		</Slider.Root>,
	);
}

describe('slider', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('slot composition', () => {
		it('renders all five slots with matching data-slot attributes', () => {
			const { container } = renderSingle({
				defaultValue: [50],
				children: null,
			});

			expect(container.querySelector('[data-slot=\'slider-root\']')).toBeInTheDocument();
			expect(container.querySelector('[data-slot=\'slider-control\']')).toBeInTheDocument();
			expect(container.querySelector('[data-slot=\'slider-track\']')).toBeInTheDocument();
			expect(container.querySelector('[data-slot=\'slider-indicator\']')).toBeInTheDocument();
			expect(container.querySelector('[data-slot=\'slider-thumb\']')).toBeInTheDocument();
		});

		it('renders two thumbs in range mode', () => {
			const { container } = renderRange({
				defaultValue: [20, 80],
				children: null,
			});

			const thumbs = container.querySelectorAll('[data-slot=\'slider-thumb\']');
			expect(thumbs.length).toBe(2);
		});
	});

	describe('cVA variant resolution', () => {
		it('applies the default md size when no size prop is given', () => {
			const { container } = renderSingle({ defaultValue: [50], children: null });
			const root = container.querySelector('[data-slot=\'slider-root\']');
			expect(root?.getAttribute('data-size')).toBe('md');
		});

		it('reflects the size prop through data-size', () => {
			const { container } = renderSingle({ defaultValue: [50], size: 'lg', children: null });
			const root = container.querySelector('[data-slot=\'slider-root\']');
			expect(root?.getAttribute('data-size')).toBe('lg');
		});

		it('reflects the orientation prop through data-orientation', () => {
			const { container } = renderSingle({
				defaultValue: [50],
				orientation: 'vertical',
				children: null,
			});
			const root = container.querySelector('[data-slot=\'slider-root\']');
			expect(root?.getAttribute('data-orientation')).toBe('vertical');
		});

		it('reflects disabled through data-disabled', () => {
			const { container } = renderSingle({
				defaultValue: [50],
				disabled: true,
				children: null,
			});
			const root = container.querySelector('[data-slot=\'slider-root\']');
			expect(root?.hasAttribute('data-disabled')).toBe(true);
		});
	});

	describe('className merging via cn()', () => {
		it('merges a consumer className onto Slider.Root', () => {
			const { container } = renderSingle({
				defaultValue: [50],
				className: 'my-slider',
				children: null,
			});
			const root = container.querySelector('[data-slot=\'slider-root\']');
			expect(root?.className).toContain('my-slider');
		});

		it('merges a consumer className onto Slider.Thumb', () => {
			const { container } = render(
				<Slider.Root defaultValue={[50]}>
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb className="my-thumb" />
					</Slider.Control>
				</Slider.Root>,
			);
			const thumb = container.querySelector('[data-slot=\'slider-thumb\']');
			expect(thumb?.className).toContain('my-thumb');
		});
	});

	describe('validation: value-out-of-range', () => {
		it('clamps a value above max and emits a structured warning', async () => {
			renderSingle({ defaultValue: [150], min: 0, max: 100, children: null });
			// The warn helper runs in a useEffect, so let the microtask queue drain.
			await Promise.resolve();
			expect(warnSpy).toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({
					component: 'Slider',
					issue: 'value-out-of-range',
					prop: 'defaultValue',
					got: [150],
					clamped: [100],
				}),
			);
		});

		it('clamps a value below min and emits a structured warning', async () => {
			renderSingle({ value: [-10], min: 0, max: 100, children: null });
			await Promise.resolve();
			expect(warnSpy).toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({
					component: 'Slider',
					issue: 'value-out-of-range',
					prop: 'value',
					got: [-10],
					clamped: [0],
				}),
			);
		});

		it('does not warn when every value sits inside the range', async () => {
			renderSingle({ defaultValue: [50], min: 0, max: 100, children: null });
			await Promise.resolve();
			expect(warnSpy).not.toHaveBeenCalled();
		});
	});

	describe('validation: invalid-step', () => {
		it('falls back to step 1 and emits a structured warning when step is zero', async () => {
			renderSingle({ defaultValue: [50], step: 0, children: null });
			await Promise.resolve();
			expect(warnSpy).toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({
					component: 'Slider',
					issue: 'invalid-step',
					got: 0,
					fallback: 1,
				}),
			);
		});

		it('falls back to step 1 and emits a structured warning when step is negative', async () => {
			renderSingle({ defaultValue: [50], step: -5, children: null });
			await Promise.resolve();
			expect(warnSpy).toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({
					component: 'Slider',
					issue: 'invalid-step',
					got: -5,
					fallback: 1,
				}),
			);
		});
	});

	describe('validation: invalid-bounds', () => {
		it('swaps to [min, min+1] and emits a structured warning when min equals max', async () => {
			renderSingle({ defaultValue: [50], min: 100, max: 100, children: null });
			await Promise.resolve();
			expect(warnSpy).toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({
					component: 'Slider',
					issue: 'invalid-bounds',
					min: 100,
					max: 100,
					swappedTo: [100, 101],
				}),
			);
		});

		it('swaps to [min, min+1] when min is greater than max', async () => {
			renderSingle({ defaultValue: [50], min: 50, max: 10, children: null });
			await Promise.resolve();
			expect(warnSpy).toHaveBeenCalledWith(
				'[unbranded-ds]',
				expect.objectContaining({
					component: 'Slider',
					issue: 'invalid-bounds',
					min: 50,
					max: 10,
					swappedTo: [50, 51],
				}),
			);
		});
	});

	describe('value shape contract', () => {
		it('treats a single-value default as a one-element array', () => {
			const { container } = renderSingle({ defaultValue: [50], children: null });
			const thumbs = container.querySelectorAll('[data-slot=\'slider-thumb\']');
			expect(thumbs.length).toBe(1);
		});

		it('treats a controlled value as a number[] and renders the corresponding thumbs', () => {
			const { container } = renderRange({ value: [20, 80], children: null });
			const thumbs = container.querySelectorAll('[data-slot=\'slider-thumb\']');
			expect(thumbs.length).toBe(2);
		});

		it('forwards onValueChange as a number[] callback', () => {
			const onValueChange = vi.fn();
			const { container } = render(
				<Slider.Root defaultValue={[50]} onValueChange={onValueChange}>
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb />
					</Slider.Control>
				</Slider.Root>,
			);

			// Base UI's Thumb renders a nested <input type="range">. Setting its
			// value and firing change is the simplest way to drive the change
			// pathway without simulating drag in jsdom.
			const input = container.querySelector('input[type=\'range\']') as HTMLInputElement;
			expect(input).toBeInTheDocument();
			fireEvent.change(input, { target: { value: '60' } });

			expect(onValueChange).toHaveBeenCalled();
			const firstCallArg = onValueChange.mock.calls[0]?.[0];
			expect(Array.isArray(firstCallArg)).toBe(true);
			expect(firstCallArg).toEqual([60]);
		});
	});
});
