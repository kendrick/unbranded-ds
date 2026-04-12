import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./Label";
import { Input } from "../Input/Input";
import React from "react";

const meta = {
	title: "Components/Label",
	component: Label,
	tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: "Label text" },
};

export const WithInput: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
			<Label htmlFor="name">Full name</Label>
			<Input id="name" placeholder="John Doe" />
		</div>
	),
};

export const Required: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
			<Label htmlFor="required">
				Required field <span style={{ color: "var(--color-destructive)" }}>*</span>
			</Label>
			<Input id="required" required />
		</div>
	),
};
