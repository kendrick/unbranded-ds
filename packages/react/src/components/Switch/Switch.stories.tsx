import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "storybook/test";
import { Switch } from "./Switch";
import { Label } from "../Label/Label";
import React from "react";

const meta = {
	title: "Components/Switch",
	component: Switch,
	tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

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
		<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
			<Switch id="airplane" />
			<Label htmlFor="airplane">Airplane Mode</Label>
		</div>
	),
};

export const ToggleInteraction: Story = {
	render: () => (
		<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
			<Switch id="toggle-test" />
			<Label htmlFor="toggle-test">Toggle me</Label>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const sw = canvas.getByRole("switch");
		await expect(sw).not.toBeChecked();
		await userEvent.click(sw);
		await expect(sw).toBeChecked();
	},
};
