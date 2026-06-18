import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount after every test. We run without `globals`, so RTL's auto-cleanup never
// self-registers (it only hooks a global afterEach). A component left mounted at
// teardown causes the intermittent "window is not defined" crash: this jsdom env
// has no MessageChannel, so React 19's scheduler falls back to setImmediate, and
// the queued performWorkUntilDeadline callback fires after Vitest has torn down
// window. Cleaning up drains that work while window is still alive.
afterEach(() => {
	cleanup();
});
