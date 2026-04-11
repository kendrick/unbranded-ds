import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Label } from "./Label";

describe("Label", () => {
	it("applies shadcn styling classes", () => {
		const { container } = render(<Label>Name</Label>);
		const label = container.firstElementChild!;
		expect(label.className).toContain("font-medium");
		expect(label.className).toContain("text-sm");
	});
});
