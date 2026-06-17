import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Slider } from './Slider';

const meta = {
	title: 'Components/Slider',
	component: Slider.Root,
	tags: ['autodocs'],
} satisfies Meta<typeof Slider.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: 'A single-thumb slider at midpoint with the default range of 0 to 100.',
			},
		},
	},
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]} min={0} max={100} step={1}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb aria-label="Value" />
				</Slider.Control>
			</Slider.Root>
		</div>
	),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'All three size variants stacked — `sm`, `md`, `lg` — showing how track height and thumb diameter scale together.',
			},
		},
	},
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '320px' }}>
			{(['sm', 'md', 'lg'] as const).map((size) => (
				<Slider.Root key={size} defaultValue={[50]} size={size}>
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb aria-label="Value" />
					</Slider.Control>
				</Slider.Root>
			))}
		</div>
	),
};

export const Orientations: Story = {
	parameters: {
		docs: {
			description: {
				story: 'A horizontal slider beside a vertical slider, demonstrating axis-aware layout and how arrow-key handling flips between Left/Right and Up/Down.',
			},
		},
	},
	render: () => (
		<div style={{ display: 'flex', gap: '48px', alignItems: 'flex-start' }}>
			<div style={{ width: '320px' }}>
				<Slider.Root defaultValue={[50]} orientation="horizontal">
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb aria-label="Value" />
					</Slider.Control>
				</Slider.Root>
			</div>
			<div style={{ height: '240px' }}>
				<Slider.Root defaultValue={[50]} orientation="vertical">
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb aria-label="Value" />
					</Slider.Control>
				</Slider.Root>
			</div>
		</div>
	),
};

export const Range: Story = {
	parameters: {
		docs: {
			description: {
				story: 'A two-thumb range slider. Render two `Slider.Thumb` children for the low and high values; Base UI routes each interaction to the nearest thumb.',
			},
		},
	},
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[20, 80]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb aria-label="Value" />
					<Slider.Thumb aria-label="Value" />
				</Slider.Control>
			</Slider.Root>
		</div>
	),
};

export const Disabled: Story = {
	parameters: {
		docs: {
			description: {
				story: 'A non-interactive slider — drag, keyboard, and focus on the thumb are all blocked, but the current value still renders so the disabled state stays legible.',
			},
		},
	},
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]} disabled>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb aria-label="Value" />
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
					<Slider.Thumb aria-label="Value" />
				</Slider.Control>
			</Slider.Root>
			<output style={{ fontSize: '14px' }}>
				{`Value: ${value.join(', ')}`}
			</output>
		</div>
	);
}

export const Controlled: Story = {
	parameters: {
		docs: {
			description: {
				story: 'A controlled slider where parent state drives the value. The current value renders alongside the control so screen-reader and low-vision users can confirm the exact figure.',
			},
		},
	},
	render: () => <ControlledSliderExample />,
};

export const KeyboardIncrement: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Interaction test verifying Right Arrow advances the value by the configured `step`.',
			},
		},
	},
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb aria-label="Value" />
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
	parameters: {
		docs: {
			description: {
				story: 'Interaction test verifying Home jumps the focused thumb to `min` and End jumps it to `max`.',
			},
		},
	},
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb aria-label="Value" />
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
	parameters: {
		docs: {
			description: {
				story: 'Interaction test verifying the thumb is reachable via simulated touch input and that `aria-valuenow` remains exposed afterward.',
			},
		},
	},
	render: () => (
		<div style={{ width: '320px' }}>
			<Slider.Root defaultValue={[50]}>
				<Slider.Control>
					<Slider.Track>
						<Slider.Indicator />
					</Slider.Track>
					<Slider.Thumb aria-label="Value" />
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
		// The release needs its own target: in browser mode user-event has no
		// implicit "previous position" to fall back on the way jsdom did.
		await userEvent.pointer({ keys: '[/TouchA]', target: thumb });
		await expect(thumb).toHaveAttribute('aria-valuenow');
	},
};
