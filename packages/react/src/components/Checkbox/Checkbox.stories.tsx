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

export const Default: Story = {
	parameters: { docs: { description: { story: 'An unchecked, uncontrolled checkbox in its initial state.' } } },
};

export const Checked: Story = {
	args: { defaultChecked: true },
	parameters: { docs: { description: { story: 'An uncontrolled checkbox that starts in the checked state.' } } },
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: { docs: { description: { story: 'A non-interactive checkbox at reduced opacity, removed from the tab order.' } } },
};

export const WithLabel: Story = {
	parameters: { docs: { description: { story: 'A labeled checkbox where clicking the label text also toggles the box.' } } },
	render: () => (
		// eslint-disable-next-line jsx-a11y/label-has-associated-control -- inner Checkbox is the implicit control; the linter cannot infer this from a custom component.
		<label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
			<Checkbox />
			<Label>Accept terms and conditions</Label>
		</label>
	),
};

export const ToggleInteraction: Story = {
	parameters: { docs: { description: { story: 'Interaction test verifying that clicking the checkbox toggles its state.' } } },
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
