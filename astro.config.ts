import fs from "node:fs";
import markdoc from "@astrojs/markdoc";
// Rehype plugins
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import keystatic from "@keystatic/astro";
import tailwind from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import favicons, { type Options as FaviconsOptions } from "astro-favicons";
import icon from "astro-icon";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";
// Remark plugins
import remarkDirective from "remark-directive"; /* Handle ::: directives as nodes */
import { remarkAdmonitions } from "./src/plugins/remark-admonitions"; /* Add admonitions */
import { remarkGithubCard } from "./src/plugins/remark-github-card";
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import { expressiveCodeOptions, siteConfig } from "./src/site.config";

// https://astro.build/config
export default defineConfig({
	compressHTML: true,
	output: "static",
	site: siteConfig.url,
	integrations: [
		expressiveCode(expressiveCodeOptions),
		icon(),
		sitemap(),
		mdx(),
		favicons({
			input: "public/icon.svg",
			name: siteConfig.title,
			short_name: siteConfig.title,
			background: "#1d1f21",
			themes: ["#2bbc8a"],
			manifest: {
				description: siteConfig.description,
				lang: siteConfig.lang,
				start_url: "/",
				display: "standalone",
				// favilib's types wrongly mark display_override as required; main's manifest has none
			} as NonNullable<FaviconsOptions["manifest"]>,
			// Only the icons BaseHead.astro and the manifest use
			icons: {
				favicons: ["favicon-32x32.png"],
				android: ["android-chrome-192x192.png", "android-chrome-512x512.png"],
				appleIcon: [
					{
						// Keep the icon's own transparent corners (favilib fills them by default)
						name: "apple-touch-icon.png",
						sizes: [{ width: 180, height: 180 }],
						background: false,
						transparent: true,
						rotate: false,
					},
				],
				appleStartup: false,
				windows: false,
				yandex: false,
			},
			// BaseHead.astro writes the head tags itself
			output: { html: false },
		}),
		react(),
		markdoc(),
		...(process.env.SKIP_KEYSTATIC ? [] : [keystatic()]),
	],
	markdown: {
		processor: unified({
			rehypePlugins: [
				rehypeHeadingIds,
				[rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["not-prose"] } }],
				[
					rehypeExternalLinks,
					{
						rel: ["noreferrer", "noopener"],
						target: "_blank",
					},
				],
				rehypeUnwrapImages,
			],
			remarkPlugins: [remarkReadingTime, remarkDirective, remarkGithubCard, remarkAdmonitions],
			remarkRehype: {
				footnoteLabelProperties: {
					className: [""],
				},
			},
		}),
	},
	vite: {
		optimizeDeps: {
			exclude: ["@resvg/resvg-js"],
		},
		plugins: [tailwind(), rawFonts([".ttf", ".woff"])],
	},
});

function rawFonts(ext: string[]): import("vite").Plugin {
	return {
		name: "vite-plugin-raw-fonts",
		transform(_code: string, id: string) {
			if (ext.some((e) => id.endsWith(e))) {
				const buffer = fs.readFileSync(id);
				return {
					code: `export default ${JSON.stringify(buffer)}`,
					map: null,
				};
			}
			return undefined;
		},
	};
}
