// ABOUTME: Smoke tests for project configuration and the Keystatic-managed homepage content contract.
// ABOUTME: Catches missing config files and homepage fields the index page depends on before build/deploy.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(import.meta.dirname, "../../");

describe("project configuration", () => {
	it("has a valid astro config", () => {
		expect(existsSync(resolve(ROOT, "astro.config.ts"))).toBe(true);
	});

	it("extends the strictest astro tsconfig", () => {
		const tsconfigPath = resolve(ROOT, "tsconfig.json");
		expect(existsSync(tsconfigPath)).toBe(true);

		const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
		expect(tsconfig.extends).toBe("astro/tsconfigs/strictest");
	});

	it("has content config", () => {
		expect(existsSync(resolve(ROOT, "src/content.config.ts"))).toBe(true);
	});
});

describe("homepage content contract", () => {
	// Every field src/pages/index.astro renders. Keystatic edits homepage.json
	// through the GitHub admin, so a bad save or merge can drop fields without
	// any type error — this is the safety net.
	const REQUIRED_FIELDS = [
		"heroTitle",
		"heroDescription",
		"heroCtaLabel",
		"mainProblemTitle",
		"mainProblemDescription",
		"differentiatorTitle",
		"servicesTitle",
		"servicesSubtitle",
		"servicesDescription",
		"studioTitle",
		"studioDescription",
		"aboutUsTitle",
		"aboutUsDescription",
	] as const;

	const homepage = JSON.parse(
		readFileSync(resolve(ROOT, "src/content/homepage.json"), "utf-8"),
	) as Record<string, unknown>;

	it.each(REQUIRED_FIELDS)("homepage.json has a non-empty %s", (field) => {
		expect(homepage[field], `missing field: ${field}`).toBeTypeOf("string");
		expect((homepage[field] as string).trim().length).toBeGreaterThan(0);
	});

	// heroCtaUrl must exist as a string but MAY be empty — the hero button
	// renders only when a URL is set, so an empty string is a valid state.
	it("homepage.json has heroCtaUrl as a string (may be empty)", () => {
		expect(homepage.heroCtaUrl).toBeTypeOf("string");
	});
});
