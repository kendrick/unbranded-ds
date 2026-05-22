import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Label } from '../Label/Label';
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
