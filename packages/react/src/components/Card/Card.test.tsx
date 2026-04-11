import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from "./Card";

describe("Card", () => {
	it("renders all sub-components with correct data-slot attributes", () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>Title</CardTitle>
					<CardDescription>Desc</CardDescription>
				</CardHeader>
				<CardContent>Body</CardContent>
				<CardFooter>Foot</CardFooter>
			</Card>,
		);

		expect(screen.getByText("Title").closest("[data-slot='card-title']")).toBeInTheDocument();
		expect(screen.getByText("Desc").closest("[data-slot='card-description']")).toBeInTheDocument();
		expect(screen.getByText("Body").closest("[data-slot='card-content']")).toBeInTheDocument();
		expect(screen.getByText("Foot").closest("[data-slot='card-footer']")).toBeInTheDocument();
	});

	it("merges consumer className on Card root", () => {
		const { container } = render(<Card className="max-w-sm">Test</Card>);
		const card = container.firstElementChild!;
		expect(card.className).toContain("max-w-sm");
		expect(card.className).toContain("rounded");
	});
});
