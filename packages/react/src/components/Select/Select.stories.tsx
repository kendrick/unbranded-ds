import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from './Select';

const meta = {
	title: 'Components/Select',
	component: Select,
	tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'The baseline uncontrolled Select with a placeholder and three options. Open the popup with click or `Space`/`Enter`/`Arrow Down`, then pick an item with the keyboard or mouse.',
			},
		},
	},
	render: () => (
		<Select>
			<SelectTrigger style={{ width: '200px' }} aria-label="Select an option">
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
	parameters: {
		docs: {
			description: {
				story:
					'Groups related options under labeled headings. Reach for this when the option list spans multiple categories that benefit from screen-reader-announced section names.',
			},
		},
	},
	render: () => (
		<Select>
			<SelectTrigger style={{ width: '200px' }} aria-label="Select an option">
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
	parameters: {
		docs: {
			description: {
				story:
					'Setting `disabled` on the root Select makes the trigger inert and skips the entire control during keyboard navigation. Use when the field is temporarily unavailable but should still occupy its slot in the layout.',
			},
		},
	},
	render: () => (
		<Select disabled>
			<SelectTrigger style={{ width: '200px' }} aria-label="Select an option">
				<SelectValue>Disabled</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="a">Option A</SelectItem>
			</SelectContent>
		</Select>
	),
};

export const ManyOptions: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Demonstrates the auto-rendered scroll affordances at the top and bottom of `SelectContent` when the option list overflows the popup. Try scrolling the list and watch the chevron indicators appear and disappear.',
			},
		},
	},
	render: () => (
		<Select>
			<SelectTrigger style={{ width: '200px' }} aria-label="Select an option">
				<SelectValue>Pick a number</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{Array.from({ length: 20 }, (_, i) => (
					<SelectItem key={i} value={String(i + 1)}>
						Option
						{' '}
						{i + 1}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	),
};
