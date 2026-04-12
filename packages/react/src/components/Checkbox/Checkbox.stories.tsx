import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "storybook/test";
import { Checkbox } from "./Checkbox";
import { Label } from "../Label/Label";
import React from "react";

const meta = {
	title: "Components/Checkbox",
	component: Checkbox,
	tags: ["autodocs"],
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
		<label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
			<Checkbox />
			<Label>Accept terms and conditions</Label>
		</label>
	),
};

export const ToggleInteraction: Story = {
	render: () => (
		<label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
			<Checkbox />
			<Label>Toggle me</Label>
		</label>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const checkbox = canvas.getByRole("checkbox");
		await expect(checkbox).not.toBeChecked();
		await userEvent.click(checkbox);
		await expect(checkbox).toBeChecked();
	},
};
