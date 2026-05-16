import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Label } from '../Label/Label';
import { Checkbox } from './Checkbox';

const meta = {
	title: 'Components/Checkbox',
	component: Checkbox,
	tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = {
	args: { defaultChecked: true },
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const WithLabel: Story = {
	render: () => (
		// eslint-disable-next-line jsx-a11y/label-has-associated-control -- inner Checkbox is the implicit control; the linter cannot infer this from a custom component.
		<label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
			<Checkbox />
			<Label>Accept terms and conditions</Label>
		</label>
	),
};

export const ToggleInteraction: Story = {
	render: () => (
		// eslint-disable-next-line jsx-a11y/label-has-associated-control -- inner Checkbox is the implicit control; the linter cannot infer this from a custom component.
		<label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
			<Checkbox />
			<Label>Toggle me</Label>
		</label>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const checkbox = canvas.getByRole('checkbox');
		await expect(checkbox).not.toBeChecked();
		await userEvent.click(checkbox);
		await expect(checkbox).toBeChecked();
	},
};
