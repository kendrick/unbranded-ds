import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { SkipLink } from './SkipLink';

const meta = {
	title: 'Components/SkipLink',
	component: SkipLink,
	tags: ['autodocs'],
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
	render: (args) => (
		<div>
			<SkipLink {...args} />
			<nav aria-label="Primary">
				<a href="#one">One</a>
				{' | '}
				<a href="#two">Two</a>
			</nav>
			<main id="main" tabIndex={-1} style={{ paddingTop: '1rem' }}>
				<h1>Main content</h1>
				<p>
					Press Tab from the address bar (or click into the canvas and press
					Tab) to reveal the skip link in the upper-left corner.
				</p>
			</main>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'Renders a SkipLink with the default `targetId` of `"main"`. The story pairs it with a `<main id="main">` so activation has somewhere to land. The link is invisible until the user tabs to it.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const link = canvas.getByRole('link', { name: /skip to main content/i });

		// Before focus, the sr-only baseline keeps the link out of the
		// visual layout for sighted users.
		expect(link.className).toContain('sr-only');

		// Tab from the document root moves focus to the first focusable
		// element, which is the SkipLink itself.
		await userEvent.tab();
		expect(link).toHaveFocus();
	},
};

export const CustomTarget: Story = {
	args: { targetId: 'content', children: 'Skip to content' },
	render: (args) => (
		<div>
			<SkipLink {...args} />
			<nav aria-label="Primary">
				<a href="#one">One</a>
			</nav>
			<main id="content" tabIndex={-1} style={{ paddingTop: '1rem' }}>
				<h1>Content region</h1>
				<p>This region uses `id="content"` instead of the default `"main"`.</p>
			</main>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'Pass a custom `targetId` to point at any element on the page. The matching element needs the same `id` for the browser to scroll and focus it on activation.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const link = canvas.getByRole('link', { name: /skip to content/i });

		await userEvent.tab();
		expect(link).toHaveFocus();
		expect(link.getAttribute('href')).toBe('#content');

		// Pressing Enter activates the native anchor. The browser handles
		// the scroll-and-focus jump; we just confirm the keystroke does
		// not throw and the link has the right target wiring.
		await userEvent.keyboard('{Enter}');
	},
};

export const MultipleSkipTargets: Story = {
	render: () => (
		<div>
			<SkipLink targetId="main">Skip to main content</SkipLink>
			<SkipLink targetId="nav">Skip to navigation</SkipLink>
			<SkipLink targetId="footer">Skip to footer</SkipLink>
			<nav id="nav" aria-label="Primary" tabIndex={-1}>
				<h2>Navigation</h2>
				<a href="#one">One</a>
				{' | '}
				<a href="#two">Two</a>
			</nav>
			<main id="main" tabIndex={-1} style={{ paddingTop: '1rem' }}>
				<h1>Main content</h1>
				<p>Tab through the page to reach each SkipLink in turn.</p>
			</main>
			<footer id="footer" tabIndex={-1} style={{ paddingTop: '1rem' }}>
				<h2>Footer</h2>
				<p>End of page.</p>
			</footer>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					'Three SkipLinks point at three different landmarks. Each is independently focusable and activates its own anchor target, so a keyboard user can choose where to land.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const mainLink = canvas.getByRole('link', { name: /skip to main content/i });
		const navLink = canvas.getByRole('link', { name: /skip to navigation/i });
		const footerLink = canvas.getByRole('link', { name: /skip to footer/i });

		expect(mainLink.getAttribute('href')).toBe('#main');
		expect(navLink.getAttribute('href')).toBe('#nav');
		expect(footerLink.getAttribute('href')).toBe('#footer');

		// Tab cycles through the three links in DOM order.
		await userEvent.tab();
		expect(mainLink).toHaveFocus();

		await userEvent.tab();
		expect(navLink).toHaveFocus();

		await userEvent.tab();
		expect(footerLink).toHaveFocus();
	},
};
