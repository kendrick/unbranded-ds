import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import { beforeAll } from 'vitest';
import * as projectAnnotations from './preview';

// Compose addon-a11y's annotations with the preview so the test-runner registers
// addon-a11y's afterEach — the axe pass. addon-vitest sees this setProjectAnnotations
// call and registers exactly the set we pass, so a11y must be listed explicitly;
// leaving it out (the prior state) let the accessibility gate silently pass
// everything (spec 019).
const project = setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

// userEvent's synthetic touch/pointer events don't register as active OS pointers,
// so Base UI's setPointerCapture throws "No active pointer" in the real browser
// (the Slider Touch play). jsdom no-ops these; mirror that here so the plays pass.
beforeAll(() => {
	Element.prototype.setPointerCapture = () => {};
	Element.prototype.releasePointerCapture = () => {};
	Element.prototype.hasPointerCapture = () => false;
	// [CI-DIAG spec019] surface any swallowed render error/rejection in the CI log. Remove after root cause.
	window.addEventListener('error', e => console.log('[CI-DIAG error]', e.message, '@', `${e.filename}:${e.lineno}`));
	window.addEventListener('unhandledrejection', e => console.log('[CI-DIAG rejection]', String(e.reason)));
});

beforeAll(project.beforeAll);
