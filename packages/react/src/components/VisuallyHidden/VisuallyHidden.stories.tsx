import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { EyeIcon } from "lucide-react";
import { VisuallyHidden } from "./VisuallyHidden";

const meta = {
	title: "Components/VisuallyHidden",
	component: VisuallyHidden,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Hides content visually while keeping it available to assistive technology. Reach for it when an interactive control needs an accessible name that sighted users do not need to see, such as an icon-only button.",
			},
		},
	},
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { children: "Screen readers can hear this text." },
	parameters: {
		docs: {
			description: {
				story:
					"The default case wraps text in a span that disappears from the page but stays in the accessibility tree.",
			},
		},
	},
};

export const IconButton: Story = {
	render: () => (
		<button type="button">
			<EyeIcon aria-hidden="true" />
			<VisuallyHidden>Show settings</VisuallyHidden>
		</button>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Pair the component with an icon to give the button an accessible name without adding visible text.",
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByRole("button", { name: /show settings/i })
		).toBeInTheDocument();
	},
};

export const Polymorphic: Story = {
	render: () => (
		<VisuallyHidden as="div">
			This text is wrapped in a div via the as prop.
		</VisuallyHidden>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Pass `as` to render any intrinsic element. Use this when a span would break the surrounding semantics or layout.",
			},
		},
	},
};
