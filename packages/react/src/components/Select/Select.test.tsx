import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Select, SelectTrigger, SelectValue } from "./Select";

describe("Select", () => {
	it("renders trigger with correct data-slot", () => {
		const { container } = render(
			<Select>
				<SelectTrigger>
					<SelectValue placeholder="Pick one" />
				</SelectTrigger>
			</Select>,
		);

		expect(container.querySelector("[data-slot='select-trigger']")).toBeInTheDocument();
	});

	it("applies styling classes on trigger via cn", () => {
		const { container } = render(
			<Select>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
			</Select>,
		);

		const trigger = container.querySelector("[data-slot='select-trigger']")!;
		expect(trigger.className).toContain("border");
		expect(trigger.className).toContain("rounded");
	});
});
