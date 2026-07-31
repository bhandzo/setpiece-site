// ABOUTME: React island that renders an interactive Vega-Lite chart from a softcopy data sidecar
// ABOUTME: (spec + named datasets), themed from the site's CSS custom properties in light and dark.

import { useEffect, useRef, useState } from "react";
import type { VisualizationSpec } from "vega-embed";

interface VegaChartProps {
	/** A Vega-Lite spec object; `data: { name }` references resolve against `datasets`. */
	spec: Record<string, unknown>;
	/** Named-data map from the sidecar, attached via the embed spec's `datasets`. */
	datasets: Record<string, unknown[]>;
	/** Rendered as a muted figcaption below the chart. */
	caption?: string;
	/** Pixel height; a spec that declares its own height wins. */
	height?: number;
}

/** Site theme tokens the chart text and rules are drawn with. */
interface ThemeTokens {
	ink: string;
	label: string;
	hairline: string;
	font: string;
}

function readThemeTokens(): ThemeTokens {
	const styles = getComputedStyle(document.documentElement);
	const token = (name: string) => styles.getPropertyValue(name).trim();
	return {
		ink: token("--color-ink"),
		label: token("--color-muted-dark"),
		hairline: token("--hairline"),
		font: token("--font-sans"),
	};
}

export default function VegaChart({ spec, datasets, caption, height }: VegaChartProps) {
	const ref = useRef<HTMLDivElement>(null);
	// Read client-side only (getComputedStyle); null during SSR and first paint.
	const [tokens, setTokens] = useState<ThemeTokens | null>(null);

	// The theme toggle stamps `data-theme` on <html> (see ThemeProvider.astro);
	// watch it and re-read the tokens so charts re-skin without a page reload.
	useEffect(() => {
		setTokens(readThemeTokens());
		const observer = new MutationObserver(() => setTokens(readThemeTokens()));
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["data-theme"],
		});
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const container = ref.current;
		if (!container || !tokens) return;
		let cancelled = false;
		let finalize: (() => void) | undefined;
		(async () => {
			// Client-side only: vega-embed touches the DOM, so it loads on mount.
			const [{ default: vegaEmbed }, { expressionInterpreter }] = await Promise.all([
				import("vega-embed"),
				import("vega-interpreter"),
			]);
			if (cancelled) return;
			// Axis/legend/title text follows the site theme so labels stay legible
			// in both modes. Chart background stays transparent (the specs set it)
			// so bars sit on the page paper.
			const config = {
				// Config is the weakest layer: specs that set their own mark/encoding
				// tooltip override this at compile time.
				mark: { tooltip: true },
				axis: {
					labelColor: tokens.ink,
					titleColor: tokens.label,
					labelFont: tokens.font,
					titleFont: tokens.font,
					domainColor: tokens.hairline,
					tickColor: tokens.hairline,
					gridColor: tokens.hairline,
				},
				legend: {
					labelColor: tokens.ink,
					titleColor: tokens.label,
					labelFont: tokens.font,
					titleFont: tokens.font,
				},
				title: { color: tokens.ink, font: tokens.font },
			};
			const specDatasets = (spec.datasets as Record<string, unknown>) ?? {};
			const embedSpec = {
				...spec,
				// Sidecar rows attach via Vega-Lite named datasets so `data: { name }`
				// resolves at any nesting level; inline spec datasets keep precedence.
				datasets: { ...specDatasets, ...datasets },
				...(!("width" in spec) && { width: "container" }),
				...(!("height" in spec) && height !== undefined && { height }),
			} as VisualizationSpec;
			const result = await vegaEmbed(container, embedSpec, {
				mode: "vega-lite",
				actions: false,
				// Sandboxed interpreter mode: AST evaluation instead of Function()
				// codegen, so spec expressions cannot execute arbitrary code.
				ast: true,
				expr: expressionInterpreter,
				config,
			});
			if (cancelled) {
				result.finalize();
				return;
			}
			finalize = result.finalize;
		})().catch((err) => {
			console.error("VegaChart embed failed", err);
		});
		return () => {
			cancelled = true;
			finalize?.();
		};
	}, [spec, datasets, height, tokens]);

	return (
		<figure className="my-8">
			<div className="w-full" ref={ref} />
			{caption && <figcaption className="text-muted-dark mt-3 text-sm">{caption}</figcaption>}
		</figure>
	);
}
