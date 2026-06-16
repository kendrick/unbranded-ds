import { CqDemo } from './components/cq-demo';
import { ComponentGallery } from './components/gallery';

export default function Home() {
	return (
		<div className="flex flex-col gap-10">
			<section className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold">unbranded-ds — Next.js 15 starter</h1>
				<p className="text-muted-foreground">
					Wired up with the canonical two-line Tailwind import. Switch the theme and density in
					the header; both survive a reload with no flash. Every published component is below.
				</p>
			</section>
			<ComponentGallery />
			<CqDemo />
		</div>
	);
}
