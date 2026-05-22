import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '../Input/Input';
import { Label } from './Label';

const meta = {
	title: 'Components/Label',
	component: Label,
	tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: 'Label text' },
	parameters: { docs: { description: { story: 'A standalone label with default token-driven typography.' } } },
};

export const WithInput: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<Label htmlFor="name">Full name</Label>
			<Input id="name" placeholder="John Doe" />
		</div>
	),
	parameters: { docs: { description: { story: 'A label associated with an Input via `htmlFor`/`id` so assistive technology reads the field name on focus.' } } },
};

export const Required: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
			<Label htmlFor="required">
				Required field
				{' '}
				<span style={{ color: 'var(--color-destructive)' }}>*</span>
			</Label>
			<Input id="required" required />
		</div>
	),
	parameters: { docs: { description: { story: 'Pairs the field name with an inline destructive-colored asterisk to signal a required field.' } } },
};
