# Porting a softcopy report to a blog post

The report-to-blog pipeline, proven twice: `analyst-model-bake-off` (PR #8, 2026-07-31)
and `best-model-live-events-ticketing` (PR #9, 2026-08-17). Manual for now — softcopy
epic `sc-891j` (issue `sc-lsxl`, `softcopy export astro`) automates these steps; when
that ships, this doc becomes its reference spec.

## The pattern

1. **Prose → MDX** at `src/content/post/<slug>/index.mdx`. Frontmatter: `title`,
   `publishDate`, `description`, `tags`, and always `draft: true` (publishing is a
   separate human decision).
2. **Sidecar → `charts.json`** in the same directory: the report's `.data.json`
   `vegaSpecs` + `datasets`, with specs de-themed (below). Datasets copy verbatim.
3. **Charts → `<VegaChart>` embeds** (`@/components/VegaChart`, `client:visible`),
   passing `spec={charts.vegaSpecs.<name>}` and `datasets={charts.datasets}`.

## Markdoc → MDX mapping

| Report (Markdoc)             | Blog (MDX)                                          |
| ---------------------------- | --------------------------------------------------- |
| `text role=kicker` / `label` | `<p class="eyebrow text-muted-dark">…</p>`          |
| `text role=lede` / `body`    | paragraph (`tone=note` → italic)                    |
| `#` headings                 | shift one level down (the masthead owns h1)         |
| `card variant=panel` series  | numbered list or bold-lead paragraphs               |
| `vega-chart`                 | `<VegaChart>` — see prop conventions below          |
| `datatable`                  | markdown table                                      |
| `rule`                       | `---`                                               |
| `cover`, `metric`, unmapped  | drop, or leave an HTML comment for follow-up        |

## De-theming chart specs

Softcopy report specs carry hardcoded light-theme config; the blog island themes
charts from site tokens in both modes (and re-embeds on theme toggle). Per spec:

- delete the per-spec `config` block (fonts, axis/legend colors)
- set `"background": "transparent"` (the island's bone panel shows through)
- text marks: drop hardcoded `font` / `fill` (island's `config.text` supplies them)
- drop mark `stroke`s tuned to the light surface (e.g. `#F1ECE2`)
- legend `symbolFillColor`: replace dark-only grays with muted `#8A8474`
- keep: model identity color scales, scale domains, heights, `width: "container"`,
  label `dy` offsets, tickCounts — structure, never theme

## VegaChart prop conventions

- `title` — the mono-caps axis-reading line above the plot
  ("Avg minutes per deep question → · …"). Renders inside the bone panel.
- `caption` — provenance or interpretation below the panel, not a restated title.
- Interactivity: a point selection param on `fields: ["model"]` gives
  click-to-isolate. Do **not** use `bind: "legend"` — it routes selection events to
  the legend only, so dots stop responding.
- A size/color legend that restates the `title` line gets `"legend": null`.

## Dead ends (do not retry)

- **Hosting the preview folder** — Astro 404s on `public/` directory indexes, and the
  5MB `hydrate.js` OOMs `astro check`.
- **Static PNG charts** — the interim hack before the island; loses tooltips,
  theming, and interactivity.
