import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Tooltip } from './Tooltip';

const meta = {
	title: 'Components/Tooltip',
	component: Tooltip.Provider,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A token-styled tooltip wrapping Base UI\'s Tooltip primitives. Opens on hover after a configurable delay, on keyboard focus immediately, and on tap on touch devices. Dismisses on Escape. Content portals to `document.body` so it can escape ancestors that clip overflow. Honors `prefers-reduced-motion: reduce` by skipping the open and close transitions.',
			},
		},
	},
	argTypes: {
		delayDuration: {
			control: 'number',
			description:
				'Hover delay before the tooltip opens, in milliseconds. Keyboard focus bypasses this delay and opens the tooltip immediately. Default 700.',
		},
		container: {
			control: false,
			description:
				'Portal mount target for `Tooltip.Content`. Defaults to `document.body`, which lets the tooltip escape ancestors with `overflow: hidden` or `overflow: clip`. Pass an HTMLElement to mount the portal somewhere else (useful when a fixed parent owns the stacking context you want to land in).',
		},
		onOpenChange: {
			action: 'openChange',
			description:
				'Fires when the open state changes, including hover, keyboard focus, tap, Escape, and outside press. The argument is the new open state.',
		},
	},
} satisfies Meta<typeof Tooltip.Provider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		delayDuration: 200,
	},
	render: (args) => (
		<Tooltip.Provider {...args}>
			<Tooltip.Trigger>
				<Button variant="outline">Hover me</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Helpful detail</Tooltip.Content>
		</Tooltip.Provider>
	),
};

export const Sides: Story = {
	args: { delayDuration: 200 },
	render: (args) => (
		<div className="flex flex-wrap items-center justify-center gap-8 p-16">
			{(['top', 'right', 'bottom', 'left'] as const).map((side) => (
				<Tooltip.Provider key={side} {...args}>
					<Tooltip.Trigger>
						<Button variant="outline">{side}</Button>
					</Tooltip.Trigger>
					<Tooltip.Content side={side}>
						Side:
						{' '}
						{side}
					</Tooltip.Content>
				</Tooltip.Provider>
			))}
		</div>
	),
};

export const Alignments: Story = {
	args: { delayDuration: 200 },
	render: (args) => (
		<div className="flex flex-wrap items-center justify-center gap-8 p-16">
			{(['start', 'center', 'end'] as const).map((align) => (
				<Tooltip.Provider key={align} {...args}>
					<Tooltip.Trigger>
						<Button variant="outline">{align}</Button>
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom" align={align}>
						Align:
						{' '}
						{align}
					</Tooltip.Content>
				</Tooltip.Provider>
			))}
		</div>
	),
};

export const WrappingInlineElement: Story = {
	name: 'Wrapping an inline element',
	args: { delayDuration: 200 },
	parameters: {
		docs: {
			description: {
				story:
					'Use `<Tooltip.Trigger asChild>` to attach tooltip behavior to a non-button element without injecting an extra `<button>`. The citation pattern below preserves the original `<sup><a>` DOM, which matters for screen readers and inline typography.',
			},
		},
	},
	render: (args) => (
		<p className="text-sm">
			Reading text with a citation
			<sup>
				<Tooltip.Provider {...args}>
					<Tooltip.Trigger asChild>
						<a href="#source-1" className="ml-0.5 text-primary underline">
							[1]
						</a>
					</Tooltip.Trigger>
					<Tooltip.Content>Source: Smith et al., 2024</Tooltip.Content>
				</Tooltip.Provider>
			</sup>
			{' '}
			and more body text after it.
		</p>
	),
};

export const HoverToOpen: Story = {
	name: 'Hover to open',
	args: { delayDuration: 0 },
	render: (args) => (
		<Tooltip.Provider {...args}>
			<Tooltip.Trigger>
				<Button variant="outline">Hover target</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Tooltip is open</Tooltip.Content>
		</Tooltip.Provider>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: 'Hover target' });
		await userEvent.hover(trigger);
		// Content portals to document.body, so query the document, not the canvas.
		const content = await within(document.body).findByText('Tooltip is open');
		await expect(content).toBeVisible();
	},
};

export const KeyboardFocusToOpen: Story = {
	name: 'Keyboard focus opens immediately',
	args: { delayDuration: 700 },
	render: (args) => (
		<Tooltip.Provider {...args}>
			<Tooltip.Trigger>
				<Button variant="outline">Focus target</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Opened by keyboard</Tooltip.Content>
		</Tooltip.Provider>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: 'Focus target' });
		trigger.focus();
		const content = await within(document.body).findByText('Opened by keyboard');
		await expect(content).toBeVisible();
	},
};

export const EscapeDismisses: Story = {
	name: 'Escape dismisses',
	args: { delayDuration: 0 },
	render: (args) => (
		<Tooltip.Provider {...args}>
			<Tooltip.Trigger>
				<Button variant="outline">Open then Escape</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>Will close on Escape</Tooltip.Content>
		</Tooltip.Provider>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: 'Open then Escape' });
		trigger.focus();
		await within(document.body).findByText('Will close on Escape');
		await userEvent.keyboard('{Escape}');
		await expect(trigger).toHaveFocus();
	},
};
