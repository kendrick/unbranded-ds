import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Label } from '../Label/Label';
import { Input } from './Input';

const meta = {
	title: 'Components/Input',
	component: Input,
	tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { placeholder: 'Enter text...' },
	parameters: {
		docs: {
			description: {
				story: 'A text input with placeholder text shown when the field is empty.',
			},
		},
	},
};

export const Disabled: Story = {
	args: { placeholder: 'Disabled', disabled: true },
	parameters: {
		docs: {
			description: {
				story:
					'A non-interactive input at reduced opacity, removed from the tab order and announced as disabled by assistive technology.',
			},
		},
	},
};

export const WithPlaceholder: Story = {
	args: { placeholder: 'you@example.com', type: 'email' },
	parameters: {
		docs: {
			description: {
				story:
					'An email input with placeholder text and `type="email"` for mobile keyboards and native browser validation.',
			},
		},
	},
};

export const WithLabel: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<Label htmlFor="email">Email</Label>
			<Input id="email" type="email" placeholder="you@example.com" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'An input paired with a Label associated via `htmlFor`/`id` so assistive technology announces the field on focus.',
			},
		},
	},
};

export const File: Story = {
	args: { type: 'file' },
	parameters: {
		docs: {
			description: {
				story:
					'A file picker rendered through the styled native browser controls.',
			},
		},
	},
};

export const TypeInteraction: Story = {
	args: { placeholder: 'Type here...' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText('Type here...');
		await userEvent.type(input, 'hello world');
		await expect(input).toHaveValue('hello world');
	},
	parameters: {
		docs: {
			description: {
				story: 'Interaction test verifying typed characters reach the input value.',
			},
		},
	},
};
