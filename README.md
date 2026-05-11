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
mise install     # installs Node 22 + pnpm 11
pnpm install
```

`cd`ing into the repo will auto-swap your shell to the pinned Node and pnpm.

### Commands

| Command         | Action                                             |
| :-------------- | :------------------------------------------------- |
| `pnpm dev`      | Start dev server at `localhost:4321`               |
| `pnpm build`    | Build the static site to `./dist/`                 |
| `pnpm preview`  | Preview the built site locally                     |
| `pnpm check`    | Run Astro type checking                            |
| `pnpm lint`     | Run Biome lint                                     |
| `pnpm format`   | Format with Biome + Prettier                       |
| `pnpm test`     | Run Vitest                                         |

`pnpm dev` exposes a Keystatic admin UI at `/keystatic` for content editing. Builds skip Keystatic (it's dev-only).

## Writing posts

Posts live in `src/content/post/<slug>/index.md`. Co-locate any images for the post in the same directory.

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

Set `draft: false` when ready to publish.

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
mise.toml        Pinned Node + pnpm versions
```

## Credits

Originally forked from [chrismwilliams/astro-theme-cactus](https://github.com/chrismwilliams/astro-theme-cactus). The cactus theme docs cover features not duplicated here (Pagefind search, webmentions, OG image generation, admonitions).
