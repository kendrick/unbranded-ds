import type { Meta, StoryObj } from '@storybook/react-vite';

import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { SegmentedControl } from './SegmentedControl';

const meta = {
	title: 'Components/SegmentedControl',
	component: SegmentedControl.Root,
	tags: ['autodocs'],
} satisfies Meta<typeof SegmentedControl.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		defaultValue: 'medium',
		children: (
			<>
				<SegmentedControl.Item value="small">Small</SegmentedControl.Item>
				<SegmentedControl.Item value="medium">Medium</SegmentedControl.Item>
				<SegmentedControl.Item value="large">Large</SegmentedControl.Item>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story:
					'Three options with the middle one selected by default. Click any item to change the selection; the previously selected item deselects automatically.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const radios = canvas.getAllByRole('radio');

		// Middle item starts checked because `defaultValue="medium"`.
		expect(radios[1]?.getAttribute('aria-checked')).toBe('true');

		await userEvent.click(radios[0]!);
		expect(radios[0]?.getAttribute('aria-checked')).toBe('true');
		expect(radios[1]?.getAttribute('aria-checked')).toBe('false');

		await userEvent.click(radios[2]!);
		expect(radios[2]?.getAttribute('aria-checked')).toBe('true');
		expect(radios[0]?.getAttribute('aria-checked')).toBe('false');
	},
};

export const Sizes: Story = {
	args: {
		defaultValue: 'b',
		children: (
			<SegmentedControl.Item value="b">Placeholder</SegmentedControl.Item>
		),
	},
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
			<SegmentedControl.Root defaultValue="b" size="sm">
				<SegmentedControl.Item value="a">Small A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">Small B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">Small C</SegmentedControl.Item>
			</SegmentedControl.Root>

			<SegmentedControl.Root defaultValue="b" size="md">
				<SegmentedControl.Item value="a">Medium A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">Medium B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">Medium C</SegmentedControl.Item>
			</SegmentedControl.Root>

			<SegmentedControl.Root defaultValue="b" size="lg">
				<SegmentedControl.Item value="a">Large A</SegmentedControl.Item>
				<SegmentedControl.Item value="b">Large B</SegmentedControl.Item>
				<SegmentedControl.Item value="c">Large C</SegmentedControl.Item>
			</SegmentedControl.Root>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'Three size variants stacked vertically: `sm`, `md`, and `lg`. The size axis controls item height, horizontal padding, and label font size.',
			},
		},
	},
};

export const Orientations: Story = {
	args: {
		defaultValue: 'b',
		children: (
			<SegmentedControl.Item value="b">Placeholder</SegmentedControl.Item>
		),
	},
	render: () => (
		<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
			<SegmentedControl.Root defaultValue="b" orientation="horizontal">
				<SegmentedControl.Item value="a">Day</SegmentedControl.Item>
				<SegmentedControl.Item value="b">Week</SegmentedControl.Item>
				<SegmentedControl.Item value="c">Month</SegmentedControl.Item>
			</SegmentedControl.Root>

			<SegmentedControl.Root defaultValue="b" orientation="vertical">
				<SegmentedControl.Item value="a">Day</SegmentedControl.Item>
				<SegmentedControl.Item value="b">Week</SegmentedControl.Item>
				<SegmentedControl.Item value="c">Month</SegmentedControl.Item>
			</SegmentedControl.Root>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'Horizontal (Left/Right arrow navigation) and vertical (Up/Down arrow navigation) layouts side by side. Cross-axis arrow keys are intentional no-ops in both orientations.',
			},
		},
	},
};

export const Disabled: Story = {
	args: {
		defaultValue: 'b',
		disabled: true,
		children: (
			<>
				<SegmentedControl.Item value="a">First</SegmentedControl.Item>
				<SegmentedControl.Item value="b">Second</SegmentedControl.Item>
				<SegmentedControl.Item value="c">Third</SegmentedControl.Item>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story:
					'A disabled control still renders the current selection so the consumer can read the value, but interaction is suppressed. The Root carries `aria-disabled="true"`.',
			},
		},
	},
};

export const TwoItems: Story = {
	args: {
		defaultValue: 'on',
		children: (
			<>
				<SegmentedControl.Item value="off">Off</SegmentedControl.Item>
				<SegmentedControl.Item value="on">On</SegmentedControl.Item>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story:
					'A two-item segmented control. The "three or more" recommendation is advisory; two items render normally and emit no warning. Use this when a binary visual is more familiar than a Switch.',
			},
		},
	},
};

// Wrapper for the Controlled story: keeps the useState call inside a real
// component so React's rules-of-hooks linter is satisfied. Storybook calls
// the wrapper as JSX, not as a bare render function.
function ControlledExample() {
	const [value, setValue] = useState<string>('medium');
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
			<SegmentedControl.Root value={value} onValueChange={setValue}>
				<SegmentedControl.Item value="small">Small</SegmentedControl.Item>
				<SegmentedControl.Item value="medium">Medium</SegmentedControl.Item>
				<SegmentedControl.Item value="large">Large</SegmentedControl.Item>
			</SegmentedControl.Root>
			<span style={{ fontSize: '0.875rem' }}>
				Current value:
				{' '}
				<code>{value}</code>
			</span>
		</div>
	);
}

export const Controlled: Story = {
	args: {
		defaultValue: 'medium',
		children: (
			<SegmentedControl.Item value="medium">Placeholder</SegmentedControl.Item>
		),
	},
	render: () => <ControlledExample />,
	parameters: {
		docs: {
			description: {
				story:
					'Controlled usage: a parent component owns the selection via `useState` and passes `value` plus `onValueChange` to the Root. The current state renders alongside the control so the wiring is visible.',
			},
		},
	},
};

export const HorizontalKeyboard: Story = {
	args: {
		defaultValue: 'a',
		orientation: 'horizontal',
		children: (
			<>
				<SegmentedControl.Item value="a">Alpha</SegmentedControl.Item>
				<SegmentedControl.Item value="b">Beta</SegmentedControl.Item>
				<SegmentedControl.Item value="c">Gamma</SegmentedControl.Item>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story:
					'Horizontal control with a play function that verifies Right Arrow moves both focus and selection to the next item, and that Down Arrow is a no-op.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const radios = canvas.getAllByRole('radio');

		// Focus the first item so subsequent keyboard events have a target.
		radios[0]!.focus();
		expect(radios[0]).toHaveFocus();
		expect(radios[0]?.getAttribute('aria-checked')).toBe('true');

		// Right Arrow moves focus and selection to the next item.
		await userEvent.keyboard('{ArrowRight}');
		expect(radios[1]).toHaveFocus();
		expect(radios[1]?.getAttribute('aria-checked')).toBe('true');

		// Down Arrow is a no-op on a horizontal control.
		await userEvent.keyboard('{ArrowDown}');
		expect(radios[1]).toHaveFocus();
		expect(radios[1]?.getAttribute('aria-checked')).toBe('true');
	},
};

export const VerticalKeyboard: Story = {
	args: {
		defaultValue: 'a',
		orientation: 'vertical',
		children: (
			<>
				<SegmentedControl.Item value="a">One</SegmentedControl.Item>
				<SegmentedControl.Item value="b">Two</SegmentedControl.Item>
				<SegmentedControl.Item value="c">Three</SegmentedControl.Item>
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				story:
					'Vertical control with a play function that verifies Down Arrow moves both focus and selection to the next item, and that Right Arrow is a no-op.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const radios = canvas.getAllByRole('radio');

		radios[0]!.focus();
		expect(radios[0]).toHaveFocus();
		expect(radios[0]?.getAttribute('aria-checked')).toBe('true');

		// Down Arrow moves focus and selection on a vertical control.
		await userEvent.keyboard('{ArrowDown}');
		expect(radios[1]).toHaveFocus();
		expect(radios[1]?.getAttribute('aria-checked')).toBe('true');

		// Right Arrow is a no-op on a vertical control.
		await userEvent.keyboard('{ArrowRight}');
		expect(radios[1]).toHaveFocus();
		expect(radios[1]?.getAttribute('aria-checked')).toBe('true');
	},
};
