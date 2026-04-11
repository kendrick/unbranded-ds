import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Switch } from "./Switch";

describe("Switch", () => {
	it("renders with switch and thumb data-slots", () => {
		const { container } = render(<Switch />);
		expect(container.querySelector("[data-slot='switch']")).toBeInTheDocument();
		expect(container.querySelector("[data-slot='switch-thumb']")).toBeInTheDocument();
	});

	it("applies styling classes via cn", () => {
		const { container } = render(<Switch />);
		const sw = container.querySelector("[data-slot='switch']")!;
		expect(sw.className).toContain("inline-flex");
	});

	it("merges consumer className", () => {
		const { container } = render(<Switch className="my-switch" />);
		const sw = container.querySelector("[data-slot='switch']")!;
		expect(sw.className).toContain("my-switch");
	});
});
