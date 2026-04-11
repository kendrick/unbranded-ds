import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
	it("renders with checkbox data-slot", () => {
		const { container } = render(<Checkbox />);
		expect(container.querySelector("[data-slot='checkbox']")).toBeInTheDocument();
	});

	it("applies styling classes via cn", () => {
		const { container } = render(<Checkbox />);
		const checkbox = container.querySelector("[data-slot='checkbox']")!;
		expect(checkbox.className).toContain("rounded");
		expect(checkbox.className).toContain("border");
	});

	it("merges consumer className", () => {
		const { container } = render(<Checkbox className="my-check" />);
		const checkbox = container.querySelector("[data-slot='checkbox']")!;
		expect(checkbox.className).toContain("my-check");
	});
});
