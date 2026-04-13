import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
	SelectGroup,
	SelectLabel,
} from "./Select";

const meta = {
	title: "Components/Select",
	component: Select,
	tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<Select>
			<SelectTrigger style={{ width: "200px" }}>
				<SelectValue>Select a fruit</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="apple">Apple</SelectItem>
				<SelectItem value="banana">Banana</SelectItem>
				<SelectItem value="cherry">Cherry</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const WithGroups: Story = {
	render: () => (
		<Select>
			<SelectTrigger style={{ width: "200px" }}>
				<SelectValue>Select a food</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Fruits</SelectLabel>
					<SelectItem value="apple">Apple</SelectItem>
					<SelectItem value="banana">Banana</SelectItem>
				</SelectGroup>
				<SelectGroup>
					<SelectLabel>Vegetables</SelectLabel>
					<SelectItem value="carrot">Carrot</SelectItem>
					<SelectItem value="lettuce">Lettuce</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	),
};

export const Disabled: Story = {
	render: () => (
		<Select disabled>
			<SelectTrigger style={{ width: "200px" }}>
				<SelectValue>Disabled</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="a">Option A</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const ManyOptions: Story = {
	render: () => (
		<Select>
			<SelectTrigger style={{ width: "200px" }}>
				<SelectValue>Pick a number</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{Array.from({ length: 20 }, (_, i) => (
					<SelectItem key={i} value={String(i + 1)}>
						Option {i + 1}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	),
};
