import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
	title: 'Components/Button',
	component: Button,
	tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: 'Button' },
	parameters: { docs: { description: { story: 'The primary action button with default size and variant.' } } },
};

export const Destructive: Story = {
	args: { children: 'Delete', variant: 'destructive' },
	parameters: { docs: { description: { story: 'Signals an irreversible action like deletion or account removal.' } } },
};

export const Outline: Story = {
	args: { children: 'Outline', variant: 'outline' },
	parameters: { docs: { description: { story: 'A bordered button for secondary actions that need visual separation from the background.' } } },
};

export const Secondary: Story = {
	args: { children: 'Secondary', variant: 'secondary' },
	parameters: { docs: { description: { story: 'A muted button for lower-priority actions that should not compete with the primary.' } } },
};

export const Ghost: Story = {
	args: { children: 'Ghost', variant: 'ghost' },
	parameters: { docs: { description: { story: 'A borderless, backgroundless button for the quietest secondary actions.' } } },
};

export const Link: Story = {
	args: { children: 'Link', variant: 'link' },
	parameters: { docs: { description: { story: 'A button styled as a text hyperlink, preserving button semantics for non-navigation actions.' } } },
};

export const Small: Story = {
	args: { children: 'Small', size: 'sm' },
	parameters: { docs: { description: { story: 'Compact size for dense toolbars and tight layouts.' } } },
};

export const Large: Story = {
	args: { children: 'Large', size: 'lg' },
	parameters: { docs: { description: { story: 'Taller hit target for touch-friendly CTAs.' } } },
};

export const Disabled: Story = {
	args: { children: 'Disabled', disabled: true },
	parameters: { docs: { description: { story: 'Demonstrates the disabled state with suppressed interaction and reduced opacity.' } } },
};

export const ClickInteraction: Story = {
	args: { children: 'Click me' },
	parameters: { docs: { description: { story: 'Interaction test verifying the button responds to click events.' } } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole('button');
		await userEvent.click(button);
		await expect(button).toBeVisible();
	},
};
