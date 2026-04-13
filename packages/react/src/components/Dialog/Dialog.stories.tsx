import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "storybook/test";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogClose,
} from "./Dialog";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { Label } from "../Label/Label";

const meta = {
	title: "Components/Dialog",
	component: Dialog,
	tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger render={<Button />}>Open Dialog</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Dialog Title</DialogTitle>
					<DialogDescription>
						This is a dialog description. It provides context.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
					<Button>Confirm</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

export const WithForm: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger render={<Button />}>Edit Profile</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit profile</DialogTitle>
					<DialogDescription>
						Make changes to your profile here.
					</DialogDescription>
				</DialogHeader>
				<div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
					<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						<Label htmlFor="dialog-name">Name</Label>
						<Input id="dialog-name" defaultValue="John Doe" />
					</div>
					<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
						<Label htmlFor="dialog-email">Email</Label>
						<Input id="dialog-email" type="email" defaultValue="john@example.com" />
					</div>
				</div>
				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
					<Button>Save changes</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
};

export const OpenCloseInteraction: Story = {
	render: () => (
		<Dialog>
			<DialogTrigger render={<Button />}>Open</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Interaction Test</DialogTitle>
					<DialogDescription>This dialog tests open/close.</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="outline" />}>Close</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button", { name: "Open" });
		await userEvent.click(trigger);
		await expect(await within(document.body).findByText("Interaction Test")).toBeVisible();
	},
};
