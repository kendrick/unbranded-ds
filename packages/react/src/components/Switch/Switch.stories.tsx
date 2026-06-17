import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Label } from '../Label/Label';
import { Switch } from './Switch';

const meta = {
	title: 'Components/Switch',
	component: Switch,
	args: { 'aria-label': 'Airplane mode' },
	tags: ['autodocs'],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: 'An off-state switch in its initial uncontrolled state.',
			},
		},
	},
};

export const Checked: Story = {
	args: { defaultChecked: true },
	parameters: {
		docs: {
			description: {
				story: 'An uncontrolled switch with an initial on state.',
			},
		},
	},
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: {
			description: {
				story:
					'A non-interactive switch at reduced opacity, removed from the tab order.',
			},
		},
	},
};

export const WithLabel: Story = {
	render: () => (
		<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
			<Switch id="airplane" aria-labelledby="sw-airplane" />
			<Label id="sw-airplane" htmlFor="airplane">Airplane Mode</Label>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'A labeled switch where clicking the label text also toggles the switch.',
			},
		},
	},
};

export const ToggleInteraction: Story = {
	render: () => (
		<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
			<Switch id="toggle-test" aria-labelledby="sw-toggle" />
			<Label id="sw-toggle" htmlFor="toggle-test">Toggle me</Label>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const sw = canvas.getByRole('switch');
		await expect(sw).not.toBeChecked();
		await userEvent.click(sw);
		await expect(sw).toBeChecked();
	},
	parameters: {
		docs: {
			description: {
				story:
					'Interaction test verifying that clicking the switch toggles its state.',
			},
		},
	},
};
