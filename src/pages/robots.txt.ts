// ABOUTME: Serves /robots.txt, allowing all crawlers.
// ABOUTME: Points at the sitemap under `site` from astro.config.ts, so it follows the domain.
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) =>
	new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap-index.xml", site)}\n`);
