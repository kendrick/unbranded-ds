import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within, userEvent } from "storybook/test";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs";

const meta = {
	title: "Components/Tabs",
	component: Tabs,
	tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Tabs defaultValue="account">
			<TabsList>
				<TabsTrigger value="account">Account</TabsTrigger>
				<TabsTrigger value="password">Password</TabsTrigger>
			</TabsList>
			<TabsContent value="account">
				<p>Manage your account settings.</p>
			</TabsContent>
			<TabsContent value="password">
				<p>Change your password here.</p>
			</TabsContent>
		</Tabs>
	),
};

export const ManyTabs: Story = {
	render: () => (
		<Tabs defaultValue="tab-1">
			<TabsList>
				{Array.from({ length: 6 }, (_, i) => (
					<TabsTrigger key={i} value={`tab-${i + 1}`}>
						Tab {i + 1}
					</TabsTrigger>
				))}
			</TabsList>
			{Array.from({ length: 6 }, (_, i) => (
				<TabsContent key={i} value={`tab-${i + 1}`}>
					<p>Content for tab {i + 1}.</p>
				</TabsContent>
			))}
		</Tabs>
	),
};

export const TabSwitchInteraction: Story = {
	render: () => (
		<Tabs defaultValue="first">
			<TabsList>
				<TabsTrigger value="first">First</TabsTrigger>
				<TabsTrigger value="second">Second</TabsTrigger>
			</TabsList>
			<TabsContent value="first">
				<p>First panel content</p>
			</TabsContent>
			<TabsContent value="second">
				<p>Second panel content</p>
			</TabsContent>
		</Tabs>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText("First panel content")).toBeVisible();
		const secondTab = canvas.getByRole("tab", { name: "Second" });
		await userEvent.click(secondTab);
		await expect(canvas.getByText("Second panel content")).toBeVisible();
	},
};
