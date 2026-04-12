import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "storybook/test";
import { Input } from "./Input";
import { Label } from "../Label/Label";
import React from "react";

const meta = {
	title: "Components/Input",
	component: Input,
	tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { placeholder: "Enter text..." },
};

export const Disabled: Story = {
	args: { placeholder: "Disabled", disabled: true },
};

export const WithPlaceholder: Story = {
	args: { placeholder: "you@example.com", type: "email" },
};

export const WithLabel: Story = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
			<Label htmlFor="email">Email</Label>
			<Input id="email" type="email" placeholder="you@example.com" />
		</div>
	),
};

export const File: Story = {
	args: { type: "file" },
};

export const TypeInteraction: Story = {
	args: { placeholder: "Type here..." },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByPlaceholderText("Type here...");
		await userEvent.type(input, "hello world");
		await expect(input).toHaveValue("hello world");
	},
};
