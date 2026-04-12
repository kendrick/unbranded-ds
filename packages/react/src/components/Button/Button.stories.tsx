import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "storybook/test";
import { Button } from "./Button";

const meta = {
	title: "Components/Button",
	component: Button,
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: "select",
			options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
		},
		size: {
			control: "select",
			options: ["default", "xs", "sm", "lg", "icon"],
		},
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: "Button" },
};

export const Destructive: Story = {
	args: { children: "Delete", variant: "destructive" },
};

export const Outline: Story = {
	args: { children: "Outline", variant: "outline" },
};

export const Secondary: Story = {
	args: { children: "Secondary", variant: "secondary" },
};

export const Ghost: Story = {
	args: { children: "Ghost", variant: "ghost" },
};

export const Link: Story = {
	args: { children: "Link", variant: "link" },
};

export const Small: Story = {
	args: { children: "Small", size: "sm" },
};

export const Large: Story = {
	args: { children: "Large", size: "lg" },
};

export const Disabled: Story = {
	args: { children: "Disabled", disabled: true },
};

export const ClickInteraction: Story = {
	args: { children: "Click me" },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const button = canvas.getByRole("button");
		await userEvent.click(button);
		await expect(button).toBeVisible();
	},
};
