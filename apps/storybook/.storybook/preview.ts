import { definePreview } from "@storybook/react-vite";
import React from "react";

import "@unbranded-ds/tokens/dist/css/tokens-light.css";
import "@unbranded-ds/tokens/dist/css/tokens-dark.css";
import "@unbranded-ds/tokens/dist/css/tokens-brand.css";
import "@unbranded-ds/tokens/dist/tailwind/preset.css";
import "./styles.css";

export default definePreview({
	globalTypes: {
		theme: {
			description: "Theme for components",
			toolbar: {
				title: "Theme",
				icon: "paintbrush",
				items: [
					{ value: "light", title: "Light" },
					{ value: "dark", title: "Dark" },
					{ value: "brand", title: "Brand" },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: {
		theme: "light",
	},
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme || "light";

			React.useEffect(() => {
				document.documentElement.setAttribute("data-theme", theme);
				localStorage.setItem("ds-theme", theme);
			}, [theme]);

			return React.createElement(
				"div",
				{ "data-theme": theme },
				React.createElement(Story),
			);
		},
	],
	parameters: {
		a11y: {
			test: "error",
		},
	},
});
