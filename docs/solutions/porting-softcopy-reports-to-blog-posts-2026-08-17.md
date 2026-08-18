# Porting a softcopy report to a blog post

The report-to-blog pipeline, proven with `best-model-live-events-ticketing` (PR #9,
2026-08-17) and updated for Keystatic-native MDX authoring in PR #11. Manual for now —
softcopy epic `sc-891j` (issue `sc-lsxl`, `softcopy export astro`) automates these
steps; when that ships, this doc becomes its reference spec.

## The pattern

1. **Prose → MDX** at `src/content/post/<slug>/index.mdx`. Frontmatter: `title`,
   `publishDate`, `description`, `tags`, and always `draft: true` (publishing is a
   separate human decision).
2. **Sidecar → `charts.json`** in the same directory: the report's `.data.json`
   `vegaSpecs` + `datasets`, with specs de-themed (below). Datasets copy verbatim.
3. **Charts → `<Chart name="…" />` blocks**. `Chart.astro` resolves the named spec
   and datasets from the current post's sidecar, then hydrates `VegaChart` on demand.
   The MDX file does not import either component or data.
4. **Labels → `<SectionLabel>` wrappers**, written on multiple lines so Keystatic
   parses them as block content.

## Markdoc → MDX mapping

| Report (Markdoc)             | Blog (MDX)                                    |
| ---------------------------- | --------------------------------------------- |
| `text role=kicker` / `label` | multiline `<SectionLabel>` wrapper            |
| `text role=lede` / `body`    | paragraph (`tone=note` → italic)              |
| `#` headings                 | shift one level down (the masthead owns h1)   |
| `card variant=panel` series  | numbered list or bold-lead paragraphs         |
| `vega-chart`                 | `<Chart name="…" />` — see conventions below  |
| `datatable`                  | markdown table                                |
| `rule`                       | `---`                                         |
| `cover`, `metric`, unmapped  | drop, or track the follow-up outside the post |

## Keystatic-safe MDX

- Do not add `import` statements to post content. Astro injects registered components
  through the post renderer, and `Chart` loads the colocated sidecar.
- Write wrapper components as block nodes:

  ```mdx
  <SectionLabel>

  Six deep questions · live warehouse queries

  </SectionLabel>
  ```

- Keep `Chart` self-closing. Its `name` must match a key in `charts.json` under
  `vegaSpecs`; missing sidecars and names fail loudly during rendering.
- Register any new authoring component in both `keystatic.config.ts` and the component
  map passed to `<Content>` in `src/pages/posts/[...slug].astro`.
- Keep scratch `.md` and `.mdx` files outside `src/content/post`. Astro's content glob
  treats every matching file beneath that directory as content.

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

## Chart authoring conventions

- `name` — required key in the post sidecar's `vegaSpecs` object.
- `title` — the mono-caps axis-reading line above the plot
  ("Avg minutes per deep question → · …"). Renders inside the bone panel.
- `caption` — provenance or interpretation below the panel, not a restated title.
- `height` — optional pixel-height override; prefer the height in the Vega-Lite spec
  unless the post needs a presentation-specific adjustment.
- Interactivity: a point selection param on `fields: ["model"]` gives
  click-to-isolate. Do **not** use `bind: "legend"` — it routes selection events to
  the legend only, so dots stop responding.
- A size/color legend that restates the `title` line gets `"legend": null`.

## Dead ends (do not retry)

- **Hosting the preview folder** — Astro 404s on `public/` directory indexes, and the
  5MB `hydrate.js` OOMs `astro check`.
- **Static PNG charts** — the interim hack before the island; loses tooltips,
  theming, and interactivity.
- **Imports inside post MDX** — Keystatic statically analyzes the content and cannot
  edit posts that import components or sidecars directly.
