import { PinnedVaporwave } from '../components/pinned-vaporwave';

export default function ShowcasePage() {
	return (
		<div className="flex flex-col gap-8">
			<section className="flex flex-col gap-2">
				<h1 className="text-2xl font-bold">Multi-axis composition</h1>
				<p className="text-muted-foreground">
					You navigated here and your color scheme, theme, and density stayed put: the provider in
					the root layout is the single source of truth across routes. The panel below pins the
					vaporwave aesthetic, in dark, composed with the compact density through ThemeProvider&apos;s
					{' '}
					<code>forced</code>
					{' '}
					prop, so the toggles inside it are disabled. Vaporwave is an alternative aesthetic, not
					a color-scheme (see the color-scheme axis split note in the spec).
				</p>
			</section>
			<PinnedVaporwave />
		</div>
	);
}
