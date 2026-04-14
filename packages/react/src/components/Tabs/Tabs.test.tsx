import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants } from "./Tabs";

describe("Tabs", () => {
	it("renders sub-components with correct data-slot attributes", () => {
		render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Tab A</TabsTrigger>
					<TabsTrigger value="b">Tab B</TabsTrigger>
				</TabsList>
				<TabsContent value="a">Content A</TabsContent>
				<TabsContent value="b">Content B</TabsContent>
			</Tabs>,
		);

		expect(screen.getByText("Tab A").closest("[data-slot='tabs-trigger']")).toBeInTheDocument();
		expect(screen.getByText("Content A").closest("[data-slot='tabs-content']")).toBeInTheDocument();
	});

	it("exports tabsListVariants for standalone use", () => {
		expect(typeof tabsListVariants).toBe("function");
		const classes = tabsListVariants({ variant: "line" });
		expect(typeof classes).toBe("string");
	});
});
