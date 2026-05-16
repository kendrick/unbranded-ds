import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	SegmentedControl,
	segmentedControlItemVariants,
	segmentedControlRootVariants,
} from './SegmentedControl';

describe('segmentedControl', () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders Root and Item with the expected data-slot attributes', () => {
		const { container } = render(
			<SegmentedControl.Root defaultValue="b">
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">C</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		expect(
			container.querySelector('[data-slot=\'segmented-control-root\']'),
		).toBeInTheDocument();
		expect(
			container.querySelectorAll('[data-slot=\'segmented-control-item\']'),
		).toHaveLength(3);
	});

	it('applies role="radiogroup" on Root and role="radio" on each Item', () => {
		const { getByRole, getAllByRole } = render(
			<SegmentedControl.Root defaultValue="a">
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		expect(getByRole('radiogroup')).toBeInTheDocument();
		expect(getAllByRole('radio')).toHaveLength(2);
	});

	it('merges a consumer className with the CVA baseline via cn() on Root', () => {
		const { container } = render(
			<SegmentedControl.Root defaultValue="a" className="my-custom-root">
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const root = container.querySelector<HTMLElement>(
			'[data-slot=\'segmented-control-root\']',
		);
		expect(root?.className).toContain('my-custom-root');
		// CVA baseline classes survive the merge — sample one stable utility
		// from the Root's `cva` first argument.
		expect(root?.className).toContain('inline-flex');
	});

	it('merges a consumer className with the CVA baseline via cn() on Item', () => {
		const { container } = render(
			<SegmentedControl.Root defaultValue="a">
				<SegmentedControl.Item value="a" className="my-custom-item">
					A
				</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const item = container.querySelector<HTMLElement>(
			'[data-slot=\'segmented-control-item\']',
		);
		expect(item?.className).toContain('my-custom-item');
		expect(item?.className).toContain('inline-flex');
	});

	it('resolves the size axis through the segmentedControlRootVariants helper', () => {
		// sm -> h-7 on items, md -> h-8, lg -> h-10. Verify the exposed helper
		// keeps producing distinct class strings so the variant axis can't
		// silently collapse during refactor.
		const sm = segmentedControlItemVariants({
			size: 'sm',
			orientation: 'horizontal',
		});
		const md = segmentedControlItemVariants({
			size: 'md',
			orientation: 'horizontal',
		});
		const lg = segmentedControlItemVariants({
			size: 'lg',
			orientation: 'horizontal',
		});

		expect(sm).toContain('h-7');
		expect(md).toContain('h-8');
		expect(lg).toContain('h-10');
		expect(sm).not.toBe(md);
		expect(md).not.toBe(lg);
	});

	it('resolves the orientation axis through the segmentedControlRootVariants helper', () => {
		const horizontal = segmentedControlRootVariants({
			size: 'md',
			orientation: 'horizontal',
			disabled: false,
		});
		const vertical = segmentedControlRootVariants({
			size: 'md',
			orientation: 'vertical',
			disabled: false,
		});

		expect(horizontal).toContain('flex-row');
		expect(vertical).toContain('flex-col');
	});

	it('resolves the disabled axis through the segmentedControlRootVariants helper', () => {
		const off = segmentedControlRootVariants({
			size: 'md',
			orientation: 'horizontal',
			disabled: false,
		});
		const on = segmentedControlRootVariants({
			size: 'md',
			orientation: 'horizontal',
			disabled: true,
		});

		expect(on).toContain('pointer-events-none');
		expect(off).not.toContain('pointer-events-none');
	});

	it('propagates Root size and orientation to each Item via context', () => {
		const { container } = render(
			<SegmentedControl.Root defaultValue="a" size="lg" orientation="vertical">
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const items = container.querySelectorAll<HTMLElement>(
			'[data-slot=\'segmented-control-item\']',
		);
		for (const item of items) {
			expect(item.className).toContain('h-10');
			expect(item.className).toContain('w-full');
		}
	});

	it('marks exactly one Item as checked in an uncontrolled tree', () => {
		const { getAllByRole } = render(
			<SegmentedControl.Root defaultValue="b">
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">C</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const radios = getAllByRole('radio');
		const checked = radios.filter(
			(r) => r.getAttribute('aria-checked') === 'true',
		);
		expect(checked).toHaveLength(1);
		expect(checked[0]).toHaveTextContent('B');
	});

	it('switches selection on click and deselects the previously selected Item', () => {
		const { getAllByRole, getByText } = render(
			<SegmentedControl.Root defaultValue="a">
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		fireEvent.click(getByText('B'));

		const radios = getAllByRole('radio');
		const checked = radios.filter(
			(r) => r.getAttribute('aria-checked') === 'true',
		);
		expect(checked).toHaveLength(1);
		expect(checked[0]).toHaveTextContent('B');
	});

	it('honors a controlled value: ignores internal click changes when value is fixed', () => {
		// With `value` set and no `onValueChange`, the consumer is the source
		// of truth. The wrapper must not flip aria-checked locally.
		const { getAllByRole, getByText, rerender } = render(
			<SegmentedControl.Root value="a">
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		fireEvent.click(getByText('B'));

		let checked = getAllByRole('radio').filter(
			(r) => r.getAttribute('aria-checked') === 'true',
		);
		expect(checked[0]).toHaveTextContent('A');

		// Now mimic an external update flipping the controlled value.
		rerender(
			<SegmentedControl.Root value="b">
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);
		checked = getAllByRole('radio').filter(
			(r) => r.getAttribute('aria-checked') === 'true',
		);
		expect(checked[0]).toHaveTextContent('B');
	});

	it('calls onValueChange with the new string value on selection', () => {
		const onValueChange = vi.fn();
		const { getByText } = render(
			<SegmentedControl.Root defaultValue="a" onValueChange={onValueChange}>
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		fireEvent.click(getByText('B'));
		expect(onValueChange).toHaveBeenCalledWith('b');
	});

	it('reflects aria-disabled on the Root when disabled', () => {
		const { getByRole } = render(
			<SegmentedControl.Root defaultValue="a" disabled>
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		expect(getByRole('radiogroup').getAttribute('aria-disabled')).toBe('true');
	});

	it('swallows cross-axis arrow keys: ArrowDown on a horizontal control does nothing', () => {
		const onValueChange = vi.fn();
		const { getAllByRole } = render(
			<SegmentedControl.Root
				defaultValue="b"
				orientation="horizontal"
				onValueChange={onValueChange}
			>
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">C</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const radios = getAllByRole('radio');
		const middle = radios[1]!;
		middle.focus();

		fireEvent.keyDown(middle, { key: 'ArrowDown' });
		fireEvent.keyDown(middle, { key: 'ArrowUp' });

		expect(onValueChange).not.toHaveBeenCalled();
		const stillChecked = radios.filter(
			(r) => r.getAttribute('aria-checked') === 'true',
		);
		expect(stillChecked[0]).toHaveTextContent('B');
	});

	it('swallows cross-axis arrow keys: ArrowRight on a vertical control does nothing', () => {
		const onValueChange = vi.fn();
		const { getAllByRole } = render(
			<SegmentedControl.Root
				defaultValue="b"
				orientation="vertical"
				onValueChange={onValueChange}
			>
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">C</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const radios = getAllByRole('radio');
		const middle = radios[1]!;
		middle.focus();

		fireEvent.keyDown(middle, { key: 'ArrowLeft' });
		fireEvent.keyDown(middle, { key: 'ArrowRight' });

		expect(onValueChange).not.toHaveBeenCalled();
		const stillChecked = radios.filter(
			(r) => r.getAttribute('aria-checked') === 'true',
		);
		expect(stillChecked[0]).toHaveTextContent('B');
	});

	it('jumps focus and selection to the first item on Home in a horizontal control', () => {
		const onValueChange = vi.fn();
		const { getAllByRole } = render(
			<SegmentedControl.Root
				defaultValue="b"
				orientation="horizontal"
				onValueChange={onValueChange}
			>
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">C</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const radios = getAllByRole('radio');
		const middle = radios[1]!;
		middle.focus();

		fireEvent.keyDown(middle, { key: 'Home' });

		expect(onValueChange).toHaveBeenCalledWith('a');
		expect(document.activeElement).toBe(radios[0]);
	});

	it('jumps focus and selection to the last item on End in a horizontal control', () => {
		const onValueChange = vi.fn();
		const { getAllByRole } = render(
			<SegmentedControl.Root
				defaultValue="b"
				orientation="horizontal"
				onValueChange={onValueChange}
			>
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">C</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const radios = getAllByRole('radio');
		const middle = radios[1]!;
		middle.focus();

		fireEvent.keyDown(middle, { key: 'End' });

		expect(onValueChange).toHaveBeenCalledWith('c');
		expect(document.activeElement).toBe(radios[2]);
	});

	it('supports Home and End in a vertical control', () => {
		const onValueChange = vi.fn();
		const { getAllByRole } = render(
			<SegmentedControl.Root
				defaultValue="b"
				orientation="vertical"
				onValueChange={onValueChange}
			>
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">C</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const radios = getAllByRole('radio');
		const middle = radios[1]!;
		middle.focus();

		fireEvent.keyDown(middle, { key: 'End' });
		expect(onValueChange).toHaveBeenLastCalledWith('c');
		expect(document.activeElement).toBe(radios[2]);

		fireEvent.keyDown(radios[2]!, { key: 'Home' });
		expect(onValueChange).toHaveBeenLastCalledWith('a');
		expect(document.activeElement).toBe(radios[0]);
	});

	it('emits a structured warning when rendered with zero items', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		render(<SegmentedControl.Root>{[]}</SegmentedControl.Root>);

		expect(spy).toHaveBeenCalledWith('[unbranded-ds]', {
			component: 'SegmentedControl',
			issue: 'no-items',
		});
	});

	it('renders two items without emitting a warning (edge case)', () => {
		const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

		render(
			<SegmentedControl.Root defaultValue="a">
				<SegmentedControl.Item value="a">A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">B</SegmentedControl.Item>
			</SegmentedControl.Root>,
		);

		const noItemsWarnings = spy.mock.calls.filter(
			(args) =>
				typeof args[1] === 'object'
				&& args[1] !== null
				&& (args[1] as { issue?: string }).issue === 'no-items',
		);
		expect(noItemsWarnings).toHaveLength(0);
	});
});
