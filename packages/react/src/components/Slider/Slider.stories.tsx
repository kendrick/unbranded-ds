import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Slider } from './Slider';

const meta = {
	title: 'Components/Slider',
	component: Slider.Root,
	tags: ['autodocs'],
	argTypes: {
		value: {
			description:
				'Controlled value. Always an array of numbers. A single-value slider passes `[50]`; a range slider passes `[20, 80]`. Pair with `onValueChange` to drive the value yourself.',
			control: 'object',
		},
		defaultValue: {
			description:
				'Uncontrolled initial value. Same array shape as `value`: `[50]` for a single thumb, `[20, 80]` for a range.',
			control: 'object',
		},
		min: {
			description: 'Lower bound of the value range, inclusive. Default 0.',
			control: 'number',
		},
		max: {
			description: 'Upper bound of the value range, inclusive. Default 100.',
			control: 'number',
		},
		step: {
			description:
				'Increment for keyboard and drag. Default 1. Values at or below zero fall back to 1 and emit a structured warning.',
			control: 'number',
		},
		onValueChange: {
			description:
				'Fires on every value change. Receives the new value as `number[]`, matching the shape of `value` and `defaultValue`.',
			action: 'value-changed',
		},
		size: {
			description: 'Visual size axis. Affects track height and thumb diameter.',
			control: 'select',
			options: ['sm', 'md', 'lg'],
		},
		orientation: {
			description:
				'Layout axis. Horizontal sliders stretch along the inline axis; vertical sliders along the block axis.',
			control: 'select',
			options: ['horizontal', 'vertical'],
		},
		disabled: {
			description:
				'When true, blocks drag, keyboard, and focus on the thumbs. The slider still renders with the current value.',
			control: 'boolean',
		},
		className: {
			description: 'Additional classes merged onto `Slider.Root` via `cn()`.',
			control: 'text',
		},
	},
} satisfies Meta<typeof Slider.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]} min={0} max={100} step={1}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb />
				</Slider.Control>
			</Slider.Root>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '320px' }}>
			{(['sm', 'md', 'lg'] as const).map((size) => (
				<Slider.Root key={size} defaultValue={[50]} size={size}>
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb />
					</Slider.Control>
				</Slider.Root>
			))}
		</div>
	),
};

export const Orientations: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
			<div style={{ width: '320px' }}>
				<Slider.Root defaultValue={[50]} orientation="horizontal">
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb />
					</Slider.Control>
				</Slider.Root>
			</div>
			<div style={{ height: '240px' }}>
				<Slider.Root defaultValue={[50]} orientation="vertical">
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb />
					</Slider.Control>
				</Slider.Root>
			</div>
		</div>
	),
};

export const Range: Story = {
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[20, 80]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb />
					<Slider.Thumb />
				</Slider.Control>
			</Slider.Root>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]} disabled>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb />
				</Slider.Control>
			</Slider.Root>
		</div>
	),
};

// Stateful render extracted so the hook lives inside a real React component
// rather than the inline render function (which the linter does not see as a
// component).
function ControlledSliderExample() {
	const [value, setValue] = useState<number[]>([42]);
	return (
		<div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
			<Slider.Root value={value} onValueChange={setValue}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb />
				</Slider.Control>
			</Slider.Root>
			<output style={{ fontSize: '14px' }}>
				{`Value: ${value.join(', ')}`}
			</output>
		</div>
	);
}

export const Controlled: Story = {
	render: () => <ControlledSliderExample />,
};

export const KeyboardIncrement: Story = {
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb />
				</Slider.Control>
			</Slider.Root>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const thumb = canvas.getByRole('slider');
		thumb.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(thumb).toHaveAttribute('aria-valuenow', '51');
	},
};

export const KeyboardHomeEnd: Story = {
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb />
				</Slider.Control>
			</Slider.Root>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const thumb = canvas.getByRole('slider');
		thumb.focus();
		await userEvent.keyboard('{Home}');
		await expect(thumb).toHaveAttribute('aria-valuenow', '0');
		await userEvent.keyboard('{End}');
		await expect(thumb).toHaveAttribute('aria-valuenow', '100');
	},
};

export const Touch: Story = {
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb />
				</Slider.Control>
			</Slider.Root>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const thumb = canvas.getByRole('slider');
		// FR-019: touch input resolves to the same onValueChange pathway as
		// pointer and keyboard. This play asserts the thumb is reachable via a
		// simulated touch pointer and keeps aria-valuenow exposed afterwards.
		await userEvent.pointer({
			keys: '[TouchA>]',
			target: thumb,
		});
		await userEvent.pointer({ keys: '[/TouchA]' });
		await expect(thumb).toHaveAttribute('aria-valuenow');
	},
};
