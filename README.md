# setpiece-site

The marketing site for [Setpiece Strategies](https://setpiece.co/) — built with [Astro](https://astro.build) and Tailwind v4.

## Local development

### Prerequisites

Tool versions are pinned in [`mise.toml`](./mise.toml) — install [mise](https://mise.jdx.dev/) once and it handles the rest:

```fish
brew install mise
mise activate fish | source  # add to ~/.config/fish/config.fish
```

For bash/zsh, use `mise activate bash` / `mise activate zsh` and add to your shell rc.

### Setup

```fish
git clone https://github.com/bhandzo/setpiece-site.git
cd setpiece-site
mise trust       # one-time, approves the project's mise.toml
mise install     # installs Node 22 + pnpm 12 (versions locked in mise.lock)
pnpm install
mise doctor project   # optional: verify pins and lockfile are in sync
```

`cd`ing into the repo will auto-swap your shell to the pinned Node and pnpm.

### Commands

| Command          | Action                                                       |
| :--------------- | :----------------------------------------------------------- |
| `pnpm dev`       | Start the site and GitHub-backed Keystatic editor             |
| `pnpm dev:local` | Developer fallback: edit files in the local checkout         |
| `pnpm build`     | Build the static site to `./dist/`                            |
| `pnpm preview`   | Preview the built site locally                               |
| `pnpm check`     | Run Astro type checking                                      |
| `pnpm lint`      | Run Biome lint                                               |
| `pnpm format`    | Format with Biome + Prettier                                 |
| `pnpm test`      | Run Vitest                                                   |

`pnpm dev` exposes Keystatic at `http://localhost:4321/keystatic`. After GitHub login, Keystatic saves directly to the selected GitHub branch; it does not change the local checkout or require a manual push. Selecting `main` publishes through the normal Cloudflare deployment. Use `pnpm dev:local` only when a developer intentionally wants Keystatic to write files into the checkout.

The production site intentionally does not expose `/keystatic`; only the local editor server does. Editors should follow the [GitHub-backed Keystatic workflow](./docs/editing-with-keystatic.md), including the copy-paste prompts for a local agent.

### Dependency audit

`mise run deps:audit` checks every dependency against the [OSV](https://osv.dev/) vulnerability database with [osv-scanner](https://google.github.io/osv-scanner/) (pinned in `mise.toml`). It finds every lockfile in the repo on its own, so nothing needs to list them. It needs the network, so it's a manual check: it's not in CI or `mise doctor`.

It fails on any known advisory, whatever its severity; osv-scanner can't filter by severity. Fix what you can by bumping the package or adding a package-manager override. When you can't fix one yet, add an exception to `osv-scanner.toml` at the repo root (create it if it doesn't exist):

```toml
[[IgnoredVulns]]
id = "GHSA-xxxx-xxxx-xxxx"
ignoreUntil = 2026-12-31  # the audit fails again after this date
reason = "Why it can't be fixed yet, and what would clear it."
```

Every exception needs a `reason` and an `ignoreUntil`.

## Writing posts

Posts live in `src/content/post/<slug>/index.mdx`. Co-locate any images, `charts.json`, and other post assets in the same directory.

Keystatic edits post bodies as MDX. Use the registered `Chart` block to render a named chart from the post's `charts.json` file and the `SectionLabel` wrapper for compact eyebrow labels.

```mdx
<SectionLabel>

Sales by section · primary and resale

</SectionLabel>

<Chart
  name="salesBySection"
  title="Tickets sold by section"
  caption="Source: ticketing warehouse"
/>
```

Do not import components or `charts.json` inside a post. Astro supplies the registered components, and `Chart` resolves the current post's sidecar automatically. Keep scratch `.md` and `.mdx` files outside `src/content/post`; Astro discovers every matching file there as content.

Minimum frontmatter:

```yaml
---
title: "Post title"
publishDate: "1 January 2026"
description: "Short summary used for SEO and previews."
tags: ["tag-one", "tag-two"]
draft: true
---
```

Set `draft: false` when ready to publish. A post saved with `draft: true` is committed to GitHub but excluded from the production site.

## Project structure

```
src/
  components/    Astro + React components
  content/
    post/        Long-form blog posts
    note/        Short-form notes
  layouts/       Page layouts
  pages/         Routes (file-based)
  plugins/       Remark/rehype plugins
  styles/        Global CSS, Tailwind config
  site.config.ts Site-wide config (title, URL, etc.)
astro.config.ts  Astro integrations + build config
mise.toml        Pinned Node + pnpm versions, doctor checks (`mise doctor project`)
mise.lock        Exact tool versions + checksums (+ .mise/locks/)
```

## Blog design voice

Blog posts speak three type voices (the "Set Play" editorial system, PR #9): Georgia
serif for prose (`prose-blog` in `src/styles/global.css`, which documents the tokens),
aktiv-grotesk for headings, and bc-sklonar mono for data — eyebrows, table headers,
and everything inside charts. Authors use `src/components/blog/Chart.astro`, which
resolves the post sidecar and delegates to the theme-aware `src/components/VegaChart.tsx`
island. To port a softcopy report into a post, see
[`docs/solutions/porting-softcopy-reports-to-blog-posts-2026-08-17.md`](./docs/solutions/porting-softcopy-reports-to-blog-posts-2026-08-17.md).

## Credits

Originally forked from [chrismwilliams/astro-theme-cactus](https://github.com/chrismwilliams/astro-theme-cactus). The cactus theme docs cover features not duplicated here (Pagefind search, OG image generation, admonitions).
