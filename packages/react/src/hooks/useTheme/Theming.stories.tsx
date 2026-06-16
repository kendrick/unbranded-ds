import type { Meta, StoryObj } from '@storybook/react-vite';

import { ColorSchemeToggle } from '../../components/ColorSchemeToggle';
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
				<code>{`${resolved.colorScheme} / ${resolved.theme} / ${resolved.density}`}</code>
			</div>
			<div>
				preference:
				{' '}
				<code>{`${preference.colorScheme} / ${preference.theme} / ${preference.density}`}</code>
			</div>
			<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
				<button type="button" onClick={() => set({ colorScheme: 'light' })}>light</button>
				<button type="button" onClick={() => set({ colorScheme: 'dark' })}>dark</button>
				<button type="button" onClick={() => set({ colorScheme: 'system' })}>system</button>
				<button type="button" onClick={() => set({ theme: 'brand' })}>brand</button>
				<button type="button" onClick={() => set({ theme: 'vaporwave' })}>vaporwave</button>
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
					'`useTheme()` read and set, in one object. The buttons each call `set({ axis: value })` across the three axes; `resolved` and `preference` update live. Color scheme and identity are independent — setting one leaves the other alone.',
			},
		},
	},
};

function CompositionDemo() {
	const { resolved } = useTheme();
	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
			<div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
				<ColorSchemeToggle />
				<ThemeToggle />
				<DensityToggle />
			</div>
			<div style={{ fontSize: '0.875rem' }}>
				Applied:
				{' '}
				<code>{`${resolved.colorScheme} + ${resolved.theme} + ${resolved.density}`}</code>
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
					'A color-scheme toggle, an identity toggle, and a density toggle over one provider. The three axes are independent, so a combination like a brand identity in dark at compact density is just the product of three controls, not a composite variant.',
			},
		},
	},
};

export const ProviderConfig: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
			<ThemeProvider defaults={{ colorScheme: 'dark' }}>
				<div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
					<span>defaults dark:</span>
					<ColorSchemeToggle />
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
