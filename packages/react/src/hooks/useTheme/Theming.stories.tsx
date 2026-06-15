import type { Meta, StoryObj } from '@storybook/react-vite';

import { DensityToggle } from '../../components/DensityToggle';
import { ThemeToggle } from '../../components/ThemeToggle';
import { ThemeProvider } from './ThemeProvider';
import { useTheme } from './useTheme';

// This group surfaces the hook and provider in Storybook (and therefore the
// published MCP), so they are not visible only in the offline sidecar. (FR-024)
const meta = {
	title: 'Theming',
	tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

function PlaygroundDemo() {
	const { preference, resolved, set } = useTheme();
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
			<div>
				resolved:
				{' '}
				<code>{`${resolved.aesthetic} / ${resolved.density}`}</code>
			</div>
			<div>
				preference:
				{' '}
				<code>{`${preference.aesthetic} / ${preference.density}`}</code>
			</div>
			<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
				<button type="button" onClick={() => set({ aesthetic: 'light' })}>light</button>
				<button type="button" onClick={() => set({ aesthetic: 'dark' })}>dark</button>
				<button type="button" onClick={() => set({ aesthetic: 'system' })}>system</button>
				<button type="button" onClick={() => set({ aesthetic: 'vaporwave' })}>vaporwave</button>
				<button type="button" onClick={() => set({ density: 'comfortable' })}>comfortable</button>
				<button type="button" onClick={() => set({ density: 'compact' })}>compact</button>
			</div>
		</div>
	);
}

export const Playground: Story = {
	render: () => (
		<ThemeProvider>
			<PlaygroundDemo />
		</ThemeProvider>
	),
	parameters: {
		docs: {
			description: {
				story:
					'`useTheme()` read and set, in one object. The buttons each call `set({ axis: value })`; `resolved` and `preference` update live.',
			},
		},
	},
};

function CompositionDemo() {
	const { resolved } = useTheme();
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
			<div style={{ display: 'flex', gap: '1rem' }}>
				<ThemeToggle />
				<DensityToggle />
			</div>
			<div style={{ fontSize: '0.875rem' }}>
				Applied:
				{' '}
				<code>{`${resolved.aesthetic} + ${resolved.density}`}</code>
			</div>
		</div>
	);
}

export const Composition: Story = {
	render: () => (
		<ThemeProvider>
			<CompositionDemo />
		</ThemeProvider>
	),
	parameters: {
		docs: {
			description: {
				story:
					'A color-scheme toggle beside a density toggle, over one provider. The two axes are independent, so a combination like vaporwave + compact is just the product of the two controls, not a composite variant.',
			},
		},
	},
};

export const ProviderConfig: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
			<ThemeProvider defaults={{ aesthetic: 'dark' }}>
				<div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
					<span>defaults dark:</span>
					<ThemeToggle />
				</div>
			</ThemeProvider>
			<ThemeProvider forced={{ density: 'compact' }}>
				<div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
					<span>forced compact:</span>
					<DensityToggle />
				</div>
			</ThemeProvider>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: '`defaults` seed a starting value; `forced` pins an axis and disables its toggle.',
			},
		},
	},
};
