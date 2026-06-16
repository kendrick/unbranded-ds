'use client';

import type { ReactNode } from 'react';
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Checkbox,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	Input,
	Label,
	SegmentedControl,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Slider,
	Switch,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
	Tooltip,
	VisuallyHidden,
} from '@unbranded-ds/react';
import { useState } from 'react';

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="flex flex-col gap-3">
			<h2 className="text-xl font-semibold">{title}</h2>
			<div className="flex flex-wrap items-start gap-4">{children}</div>
		</section>
	);
}

export function ComponentGallery() {
	const [view, setView] = useState('grid');
	const [volume, setVolume] = useState<number[]>([50]);
	const [subscribed, setSubscribed] = useState(true);

	return (
		<div className="flex flex-col gap-10">
			<Section title="Buttons">
				<Button>Default</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="ghost" size="icon">
					<span aria-hidden>★</span>
					<VisuallyHidden>Add to favorites</VisuallyHidden>
				</Button>
			</Section>

			<Section title="Card with token-driven motion">
				<Card className="ds-motion-card w-full max-w-sm">
					<CardHeader>
						<CardTitle>Hover me</CardTitle>
						<CardDescription>The lift uses the motion tokens.</CardDescription>
					</CardHeader>
					<CardContent className="text-muted-foreground">
						The transition duration and easing come from
						{' '}
						<code>--duration-base</code>
						{' '}
						and
						{' '}
						<code>--ease-standard</code>
						.
					</CardContent>
					<CardFooter>
						<Button size="sm">Action</Button>
					</CardFooter>
				</Card>
			</Section>

			<Section title="Form controls">
				<div className="flex flex-col gap-2">
					<Label htmlFor="email">Email</Label>
					<Input id="email" type="email" placeholder="you@example.com" />
				</div>
				<div className="flex items-center gap-2">
					<Checkbox aria-labelledby="subscribe-label" checked={subscribed} onCheckedChange={(c) => setSubscribed(c)} />
					<Label id="subscribe-label">Subscribe to updates</Label>
				</div>
				<div className="flex items-center gap-2">
					<Switch aria-labelledby="airplane-label" />
					<Label id="airplane-label">Airplane mode</Label>
				</div>
			</Section>

			<Section title="Select and segmented control">
				<Select>
					<SelectTrigger className="w-48" aria-label="Select a fruit">
						<SelectValue>Pick a fruit</SelectValue>
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="apple">Apple</SelectItem>
						<SelectItem value="banana">Banana</SelectItem>
						<SelectItem value="cherry">Cherry</SelectItem>
					</SelectContent>
				</Select>
				<SegmentedControl.Root value={view} onValueChange={setView} aria-label="View">
					<SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
					<SegmentedControl.Item value="list">List</SegmentedControl.Item>
				</SegmentedControl.Root>
			</Section>

			<Section title="Slider">
				<div className="w-64">
					<Slider.Root value={volume} onValueChange={setVolume} min={0} max={100} step={1}>
						<Slider.Control>
							<Slider.Track>
								<Slider.Indicator />
							</Slider.Track>
							<Slider.Thumb aria-label="Volume" />
						</Slider.Control>
					</Slider.Root>
				</div>
			</Section>

			<Section title="Tabs">
				<Tabs defaultValue="account" className="w-full max-w-md">
					<TabsList>
						<TabsTrigger value="account">Account</TabsTrigger>
						<TabsTrigger value="password">Password</TabsTrigger>
					</TabsList>
					<TabsContent value="account">
						<p className="text-muted-foreground">Account settings.</p>
					</TabsContent>
					<TabsContent value="password">
						<p className="text-muted-foreground">Change your password.</p>
					</TabsContent>
				</Tabs>
			</Section>

			<Section title="Overlays">
				<Dialog>
					<DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Save changes?</DialogTitle>
							<DialogDescription>This publishes immediately.</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
							<Button>Save</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Tooltip.Provider delayDuration={200}>
					<Tooltip.Trigger>Hover for a tip</Tooltip.Trigger>
					<Tooltip.Content side="right">Saved automatically</Tooltip.Content>
				</Tooltip.Provider>
			</Section>
		</div>
	);
}
