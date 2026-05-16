/**
 * SSR smoke test for the four primitives added in spec 004.
 *
 * Constitution Section IX bullet 6 requires components to render server-side
 * without accessing `window`, `document`, or other browser-only globals at
 * render time. This file renders each component via `renderToString` and
 * fails if any of them throws or accesses a browser global during render.
 *
 * Browser-API access in `useEffect` is fine — effects don't run during SSR.
 */

import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SegmentedControl } from './SegmentedControl';
import { SkipLink } from './SkipLink';
import { Slider } from './Slider';
import { Tooltip } from './Tooltip';

describe('ssr safety (constitution §IX bullet 6)', () => {
	it('renders Tooltip server-side without error', () => {
		expect(() =>
			renderToString(
				<Tooltip.Provider>
					<Tooltip.Trigger>Hover</Tooltip.Trigger>
					<Tooltip.Content>Detail</Tooltip.Content>
				</Tooltip.Provider>,
			),
		).not.toThrow();
	});

	it('renders SkipLink server-side without error', () => {
		expect(() => renderToString(<SkipLink>Skip to main content</SkipLink>)).not.toThrow();
	});

	it('renders SkipLink as a real anchor with the right href on the server', () => {
		const html = renderToString(<SkipLink targetId="main">Skip</SkipLink>);
		expect(html).toContain('<a');
		expect(html).toContain('href="#main"');
	});

	it('renders Slider server-side without error in single-value mode', () => {
		expect(() =>
			renderToString(
				<Slider.Root defaultValue={[50]}>
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb />
					</Slider.Control>
				</Slider.Root>,
			),
		).not.toThrow();
	});

	it('renders Slider server-side without error in range mode', () => {
		expect(() =>
			renderToString(
				<Slider.Root defaultValue={[20, 80]}>
					<Slider.Control>
						<Slider.Track>
							<Slider.Indicator />
						</Slider.Track>
						<Slider.Thumb />
						<Slider.Thumb />
					</Slider.Control>
				</Slider.Root>,
			),
		).not.toThrow();
	});

	it('renders SegmentedControl server-side without error', () => {
		expect(() =>
			renderToString(
				<SegmentedControl.Root defaultValue="b">
					<SegmentedControl.Item value="a">A</SegmentedControl.Item>
					<SegmentedControl.Item value="b">B</SegmentedControl.Item>
					<SegmentedControl.Item value="c">C</SegmentedControl.Item>
				</SegmentedControl.Root>,
			),
		).not.toThrow();
	});
});
