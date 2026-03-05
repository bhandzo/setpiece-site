// ABOUTME: Smoke tests verifying project structure, component architecture, and code quality.
// ABOUTME: Catches configuration errors, broken imports, and hardcoded anti-patterns early.
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../../");

describe("project configuration", () => {
	it("has a valid astro config", () => {
		expect(existsSync(resolve(ROOT, "astro.config.ts"))).toBe(true);
	});

	it("has a valid tsconfig", () => {
		const tsconfigPath = resolve(ROOT, "tsconfig.json");
		expect(existsSync(tsconfigPath)).toBe(true);

		const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
		expect(tsconfig.extends).toBe("astro/tsconfigs/strictest");
	});

	it("has required layout files", () => {
		expect(existsSync(resolve(ROOT, "src/layouts/Base.astro"))).toBe(true);
		expect(existsSync(resolve(ROOT, "src/layouts/BlogPost.astro"))).toBe(true);
	});

	it("has required page files", () => {
		expect(existsSync(resolve(ROOT, "src/pages/index.astro"))).toBe(true);
		expect(existsSync(resolve(ROOT, "src/pages/about.astro"))).toBe(true);
	});

	it("has content config", () => {
		expect(existsSync(resolve(ROOT, "src/content.config.ts"))).toBe(true);
	});
});

describe("component architecture", () => {
	it("has Header and Footer layout components", () => {
		expect(existsSync(resolve(ROOT, "src/components/layout/Header.astro"))).toBe(true);
		expect(existsSync(resolve(ROOT, "src/components/layout/Footer.astro"))).toBe(true);
	});

	it("has separate CoverImage and Masthead components", () => {
		expect(existsSync(resolve(ROOT, "src/components/blog/CoverImage.astro"))).toBe(true);
		expect(existsSync(resolve(ROOT, "src/components/blog/Masthead.astro"))).toBe(true);
	});

	it("Masthead does not contain hardcoded image dimensions", () => {
		const masthead = readFileSync(resolve(ROOT, "src/components/blog/Masthead.astro"), "utf-8");
		expect(masthead).not.toContain("width={748}");
		expect(masthead).not.toContain("height={420}");
	});

	it("BlogPost layout uses CoverImage component", () => {
		const blogPost = readFileSync(resolve(ROOT, "src/layouts/BlogPost.astro"), "utf-8");
		expect(blogPost).toContain('import CoverImage from "@/components/blog/CoverImage.astro"');
		expect(blogPost).toContain("<CoverImage");
	});

	it("BlogPost layout has no inline style for max-width", () => {
		const blogPost = readFileSync(resolve(ROOT, "src/layouts/BlogPost.astro"), "utf-8");
		expect(blogPost).not.toMatch(/style="[^"]*max-width/);
	});
});

describe("code quality", () => {
	it("astro config has no @ts-expect-error or @ts-ignore", () => {
		const config = readFileSync(resolve(ROOT, "astro.config.ts"), "utf-8");
		expect(config).not.toContain("@ts-expect-error");
		expect(config).not.toContain("@ts-ignore");
	});

	it("Header has no dead mobile toggle code", () => {
		const header = readFileSync(resolve(ROOT, "src/components/layout/Header.astro"), "utf-8");
		expect(header).not.toContain("mobile-button");
		expect(header).not.toContain("MobileNavBtn");
	});
});
