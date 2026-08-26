// ABOUTME: Generates the per-post Open Graph card as a PNG via satori + resvg, styled to the
// ABOUTME: site's "Set Play" system: warm paper, ink display type, mono eyebrow, orange pass line.
import { Resvg } from "@resvg/resvg-js";
import type { APIContext, InferGetStaticPropsType } from "astro";
import type { ReactNode } from "react";
import satori, { type SatoriOptions } from "satori";
import { html } from "satori-html";
import ArchivoBold from "@/assets/archivo-700.ttf";
import Archivo from "@/assets/archivo-regular.ttf";
import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";

// Mirrors the @theme tokens in src/styles/global.css — aktiv-grotesk is an Adobe Fonts
// webfont that can't be embedded server-side, so Archivo stands in for the display face
// and Roboto Mono for bc-sklonar in the eyebrow/byline.
// (Kinetic orange #e67812 appears only inside the inline SVG below, written literally.)
const paper = "#faf8f3";
const ink = "#222019";
const mutedDark = "#6e6858";
const hairline = "rgba(34, 32, 25, 0.18)";

const ogOptions: SatoriOptions = {
	// debug: true,
	fonts: [
		{
			data: Buffer.from(Archivo),
			name: "Archivo",
			style: "normal",
			weight: 400,
		},
		{
			data: Buffer.from(ArchivoBold),
			name: "Archivo",
			style: "normal",
			weight: 700,
		},
		{
			data: Buffer.from(RobotoMono),
			name: "Roboto Mono",
			style: "normal",
			weight: 400,
		},
	],
	height: 630,
	width: 1200,
};

// Long titles step down a size or two so three lines still clear the play band.
const titleSize = (title: string) => {
	if (title.length > 68) return "text-5xl";
	if (title.length > 44) return "text-6xl";
	return "text-7xl";
};

const markup = (title: string, pubDate: string, author: string) =>
	html`<div tw="flex w-full h-full" style="background-color: ${paper}; font-family: 'Archivo'">
		<div tw="flex absolute" style="top: 0; left: 0">
			<!-- The set-play notation from the homepage hero, recomposed as a single band: an open
			     circle feeding an orange pass, with two thin ink run arrows breaking off it. Colors
			     are the ink/orange tokens, written literally because satori-html escapes substitutions. -->
			<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="78" cy="446" r="9" stroke="#222019" stroke-width="2.5" fill="none"></circle>
				<path d="M94 446 L1100 430" stroke="#e67812" stroke-width="5" stroke-linecap="round"></path>
				<path d="M1081 419 L1100 430 L1081 441" stroke="#e67812" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
				<circle cx="890" cy="472" r="10" stroke="#222019" stroke-width="3" fill="none"></circle>
				<path d="M895 450 L930 372" stroke="#222019" stroke-width="3" stroke-linecap="round"></path>
				<path d="M920 385 L930 372 L936 388" stroke="#222019" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
				<circle cx="1012" cy="460" r="9" stroke="#222019" stroke-width="2.5" fill="none"></circle>
				<path d="M1018 438 L1060 356" stroke="#222019" stroke-width="2.5" stroke-linecap="round"></path>
				<path d="M1049 369 L1060 356 L1066 372" stroke="#222019" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
			</svg>
		</div>
		<div tw="flex flex-col w-full h-full">
			<div tw="flex flex-col flex-1 justify-between px-16 pt-16 pb-24">
				<p
					tw="m-0"
					style="font-family: 'Roboto Mono'; font-size: 22px; letter-spacing: 0.08em; color: ${mutedDark}"
				>
					${pubDate}
				</p>
				<h1
					tw="flex ${titleSize(title)} font-bold m-0"
					style="max-width: 780px; letter-spacing: -0.02em; line-height: 1.05; color: ${ink}"
				>
					${title}
				</h1>
			</div>
			<div
				tw="flex items-center justify-between w-full px-16 py-10"
				style="border-top: 1px solid ${hairline}"
			>
				<div tw="flex items-center">
					<!-- The Setpiece mark from public/icon.svg, at footer scale. -->
					<svg width="52" height="52" viewBox="0 0 341 341" fill="none" xmlns="http://www.w3.org/2000/svg">
						<rect x="2" width="339" height="339" fill="#E67812"></rect>
						<path d="M204 150.119L189.856 168.375L212.739 171.496L204 150.119ZM0.372789 123.163C5.53664 130.389 12.2385 141.314 20.2419 153.803C28.2145 166.244 37.4221 180.145 47.5017 193.147C57.5734 206.139 68.5707 218.307 80.1431 227.241C91.7021 236.165 104.013 242 116.671 242V238C105.252 238 93.7918 232.725 82.5876 224.075C71.3967 215.435 60.6382 203.563 50.663 190.696C40.6956 177.838 31.5651 164.059 23.6097 151.645C15.6853 139.279 8.86942 128.173 3.62721 120.837L0.372789 123.163ZM116.671 242C159.46 242 194.135 206.949 203.511 168.43L199.624 167.484C190.58 204.643 157.205 238 116.671 238V242Z" fill="black"></path>
						<path d="M87.6499 64.8696C87.0255 63.9584 85.7807 63.7258 84.8695 64.3501L70.0208 74.5243C69.1096 75.1487 68.877 76.3934 69.5014 77.3046C70.1257 78.2158 71.3705 78.4484 72.2817 77.824L85.4806 68.7803L94.5243 81.9793C95.1486 82.8905 96.3934 83.123 97.3046 82.4987C98.2158 81.8743 98.4484 80.6295 97.824 79.7183L87.6499 64.8696ZM36.966 339.367L87.966 66.3673L84.034 65.6327L33.034 338.633L36.966 339.367Z" fill="black"></path>
						<path d="M145.895 209.457C151.67 210.62 157.294 206.881 158.457 201.105C159.62 195.33 155.881 189.706 150.105 188.543C144.33 187.38 138.706 191.119 137.543 196.895C136.38 202.67 140.119 208.294 145.895 209.457ZM179.666 48.8928C179.054 47.9729 177.813 47.723 176.893 48.3345L161.903 58.2997C160.983 58.9113 160.733 60.1527 161.345 61.0725C161.956 61.9924 163.198 62.2423 164.117 61.6308L177.442 52.7728L186.3 66.097C186.911 67.0169 188.153 67.2668 189.073 66.6553C189.992 66.0438 190.242 64.8024 189.631 63.8825L179.666 48.8928ZM149.961 199.395L179.961 50.3948L176.039 49.6052L146.039 198.605L149.961 199.395Z" fill="black"></path>
						<path d="M249.586 217.573C255.425 218.354 260.791 214.253 261.573 208.414C262.354 202.575 258.253 197.209 252.414 196.427C246.575 195.646 241.209 199.747 240.427 205.586C239.646 211.425 243.747 216.791 249.586 217.573ZM273.589 48.7858C272.919 47.9081 271.663 47.7402 270.786 48.4108L256.483 59.3389C255.605 60.0095 255.437 61.2647 256.108 62.1424C256.778 63.0201 258.034 63.188 258.911 62.5174L271.625 52.8035L281.339 65.5172C282.01 66.3949 283.265 66.5628 284.142 65.8922C285.02 65.2216 285.188 63.9665 284.517 63.0888L273.589 48.7858ZM252.982 207.265L273.982 50.2651L270.018 49.7348L249.018 206.735L252.982 207.265Z" fill="black"></path>
						<path d="M320.941 152.518C320.675 151.446 319.59 150.793 318.518 151.059L301.049 155.397C299.977 155.663 299.323 156.748 299.59 157.82C299.856 158.892 300.941 159.545 302.013 159.279L317.541 155.423L321.397 170.951C321.663 172.023 322.748 172.677 323.82 172.41C324.892 172.144 325.545 171.059 325.279 169.987L320.941 152.518ZM208.713 340.032L320.713 154.032L317.287 151.968L205.287 337.968L208.713 340.032Z" fill="black"></path>
					</svg>
					<p tw="ml-5 m-0 text-2xl font-bold" style="color: ${ink}; letter-spacing: -0.01em">
						${siteConfig.title}
					</p>
				</div>
				<p
					tw="m-0"
					style="font-family: 'Roboto Mono'; font-size: 20px; letter-spacing: 0.08em; color: ${mutedDark}"
				>
					${author}
				</p>
			</div>
		</div>
	</div>`;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { author, pubDate, title } = context.props as Props;

	const postDate = getFormattedDate(pubDate, { month: "long" }).toUpperCase();
	// satori-html's VNode is structurally what satori accepts at runtime; the two
	// packages' type declarations just don't align, hence the cast.
	const svg = await satori(
		markup(title, postDate, `BY ${author.toUpperCase()}`) as unknown as ReactNode,
		ogOptions,
	);
	const png = new Resvg(svg).render().asPng();
	return new Response(png, {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.id },
			props: {
				author: post.data.author,
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}));
}
