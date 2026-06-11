import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Label } from '../Label/Label';
import { Tooltip } from '../Tooltip/Tooltip';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './Dialog';

const meta = {
	title: 'Components/Dialog',
	component: Dialog,
	tags: ['autodocs'],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Baseline confirmation dialog: title, description, cancel, and confirm. The X icon top-right comes from DialogContent automatically.',
			},
		},
	},
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
	parameters: {
		docs: {
			description: {
				story:
					'A short form hosted inside a dialog — the standard pattern when editing a couple of related fields would feel disruptive as a full page navigation.',
			},
		},
	},
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
				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<Label htmlFor="dialog-name">Name</Label>
						<Input id="dialog-name" defaultValue="John Doe" />
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
	parameters: {
		docs: {
			description: {
				story:
					'Interaction test that clicks the trigger and verifies the portal-rendered panel becomes visible with the title announced.',
			},
		},
	},
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
		const trigger = canvas.getByRole('button', { name: 'Open' });
		await userEvent.click(trigger);
		await expect(await within(document.body).findByText('Interaction Test')).toBeVisible();
	},
};

export const TooltipStacksAboveDialog: Story = {
	name: 'Tooltip stacks above dialog',
	parameters: {
		docs: {
			description: {
				story:
					'Regression test for the nested-overlay stacking fix (spec 010). A tooltip opened on a control inside an open dialog renders above the dialog: the tooltip reads the `z-index.tooltip` stop (60) and the dialog reads `z-index.overlay` (50), so the tooltip wins. Before the fix, both stacked at a shared `z-50` with no defined order.',
			},
		},
	},
	render: () => (
		<Dialog>
			<DialogTrigger render={<Button />}>Open</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nested overlay</DialogTitle>
					<DialogDescription>A tooltip inside a dialog must stack above it.</DialogDescription>
				</DialogHeader>
				<Tooltip.Provider delayDuration={0}>
					<Tooltip.Trigger>
						<Button variant="outline">Hover for tooltip</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>Above the dialog</Tooltip.Content>
				</Tooltip.Provider>
			</DialogContent>
		</Dialog>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole('button', { name: 'Open' }));

		const body = within(document.body);
		const dialogContent = (await body.findByText('Nested overlay')).closest(
			'[data-slot="dialog-content"]',
		) as HTMLElement;

		await userEvent.hover(await body.findByRole('button', { name: 'Hover for tooltip' }));
		const tooltipContent = (await body.findByText('Above the dialog')).closest(
			'[data-slot="tooltip-content"]',
		) as HTMLElement;

		// The fix: the tooltip's z-index resolves above the dialog's, instead of
		// both sharing z-50. Reads the computed (var-resolved) values.
		const zIndexOf = (el: HTMLElement) => Number.parseInt(getComputedStyle(el).zIndex, 10);
		await expect(zIndexOf(tooltipContent)).toBeGreaterThan(zIndexOf(dialogContent));
	},
};
