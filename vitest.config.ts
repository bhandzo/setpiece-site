// ABOUTME: Vitest configuration for the Setpiece site.
// ABOUTME: Uses Astro's Vite config as base for consistent module resolution.
import { getViteConfig } from "astro/config";

export default getViteConfig({
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
	},
});
