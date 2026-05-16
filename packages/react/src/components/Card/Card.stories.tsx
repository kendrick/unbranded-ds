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
