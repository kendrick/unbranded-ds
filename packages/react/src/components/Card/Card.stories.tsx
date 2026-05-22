import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Label } from '../Label/Label';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from './Card';

const meta = {
	title: 'Components/Card',
	component: Card,
	tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story: 'A minimal card with a header and content body.',
			},
		},
	},
	render: () => (
		<Card style={{ maxWidth: '400px' }}>
			<CardHeader>
				<CardTitle>Card Title</CardTitle>
				<CardDescription>Card description goes here.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Card content area.</p>
			</CardContent>
		</Card>
	),
};

export const WithFooter: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'A card composing all three regions — header, content, and a footer with cancel and confirm buttons.',
			},
		},
	},
	render: () => (
		<Card style={{ maxWidth: '400px' }}>
			<CardHeader>
				<CardTitle>Notifications</CardTitle>
				<CardDescription>Manage your notification settings.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Choose which notifications you'd like to receive.</p>
			</CardContent>
			<CardFooter style={{ gap: '8px' }}>
				<Button variant="outline">Cancel</Button>
				<Button>Save</Button>
			</CardFooter>
		</Card>
	),
};

export const FullExample: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'A form card pattern with labeled inputs and a single primary action in the footer.',
			},
		},
	},
	render: () => (
		<Card style={{ maxWidth: '400px' }}>
			<CardHeader>
				<CardTitle>Create account</CardTitle>
				<CardDescription>Enter your details below.</CardDescription>
			</CardHeader>
			<CardContent>
				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<Label htmlFor="card-name">Name</Label>
						<Input id="card-name" placeholder="John Doe" />
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
						<Label htmlFor="card-email">Email</Label>
						<Input id="card-email" type="email" placeholder="you@example.com" />
					</div>
				</div>
			</CardContent>
			<CardFooter>
				<Button style={{ width: '100%' }}>Create account</Button>
			</CardFooter>
		</Card>
	),
};
