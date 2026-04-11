import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "./Dialog";

describe("Dialog", () => {
	it("renders sub-components with correct data-slot attributes when open", () => {
		render(
			<Dialog open>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm</DialogTitle>
						<DialogDescription>Are you sure?</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>,
		);

		expect(screen.getByText("Confirm").closest("[data-slot='dialog-title']")).toBeInTheDocument();
		expect(screen.getByText("Are you sure?").closest("[data-slot='dialog-description']")).toBeInTheDocument();
	});

	it("opens via trigger click", async () => {
		const user = userEvent.setup();
		render(
			<Dialog>
				<DialogTrigger>Open</DialogTrigger>
				<DialogContent>
					<DialogTitle>Title</DialogTitle>
				</DialogContent>
			</Dialog>,
		);

		expect(screen.queryByText("Title")).not.toBeInTheDocument();
		await user.click(screen.getByText("Open"));
		expect(screen.getByText("Title")).toBeInTheDocument();
	});
});
