import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button, buttonVariants } from './Button';

describe('button', () => {
	it('applies default variant and size classes', () => {
		const { container } = render(<Button>Click</Button>);
		const btn = container.firstElementChild!;
		expect(btn.className).toContain('bg-primary');
		expect(btn.className).toContain('h-9');
	});

	it('applies the destructive variant as the token-backed subtle treatment', () => {
		// spec 018: a subtle destructive surface + a darker destructive text token,
		// not the old translucent tint, and no per-mode color override (the per-cell
		// tokens carry light/dark).
		const classes = buttonVariants({ variant: 'destructive' });
		expect(classes).toContain('bg-destructive-subtle');
		expect(classes).toContain('text-destructive-subtle-foreground');
		expect(classes).not.toContain('bg-destructive/10');
		expect(classes).not.toContain('dark:bg-destructive');
	});

	it('applies size=lg classes', () => {
		const { container } = render(<Button size="lg">Big</Button>);
		const btn = container.firstElementChild!;
		expect(btn.className).toContain('h-10');
	});

	it('merges consumer className without clobbering variants', () => {
		const { container } = render(<Button className="mt-4">Test</Button>);
		const btn = container.firstElementChild!;
		expect(btn.className).toContain('mt-4');
		expect(btn.className).toContain('bg-primary');
	});

	it('exports buttonVariants for standalone use', () => {
		const classes = buttonVariants({ variant: 'outline', size: 'sm' });
		expect(classes).toContain('border');
		expect(classes).toContain('h-8');
	});
});
