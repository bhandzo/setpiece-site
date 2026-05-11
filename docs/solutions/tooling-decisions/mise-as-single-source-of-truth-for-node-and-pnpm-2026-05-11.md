---
title: mise.toml as the single source of truth for Node and pnpm
date: 2026-05-11
category: tooling-decisions
module: setpiece-site
problem_type: tooling_decision
component: tooling
severity: high
related_components:
  - development_workflow
  - documentation
applies_when:
  - "Onboarding a collaborator to a Node/pnpm project on a fresh machine"
  - "Choosing how to pin Node and pnpm versions in a polyglot dev environment"
  - "Upgrading to pnpm 11 (breaking changes around build-script approval and overrides)"
  - "Deciding between corepack, Volta, nvm/.nvmrc, packageManager, and mise"
  - "Aligning local dev tool versions with CI runner versions"
symptoms:
  - "Collaborator's pnpm install fails because pnpm 11 promoted ignored build scripts from warning to hard error"
  - "`corepack` command not found on collaborator's machine (Homebrew Node dropped the corepack bundle)"
  - "`pnpm.onlyBuiltDependencies` in package.json silently ignored under pnpm 11 (moved to allowBuilds in pnpm-workspace.yaml)"
  - "`pnpm.overrides` in package.json no longer applied to lockfile under pnpm 11"
  - "Three competing version sources (.nvmrc, no pnpm pin, global mise) producing inconsistent Node versions across machines"
root_cause: missing_tooling
resolution_type: tooling_addition
tags:
  - mise
  - pnpm
  - node
  - corepack
  - version-pinning
  - astro
  - onboarding
  - ci
---

# mise.toml as the single source of truth for Node and pnpm

## Context

A non-daily contributor tried to onboard locally to `setpiece-site` (Astro v5) and hit a cascade of toolchain failures that had nothing to do with the app code. The repo had three half-pins for tool versions — a `.nvmrc` (Node 22), no pin at all for pnpm, and a conflicting global `mise` config pointing at Node 24 — so different machines silently disagreed about which versions to use. pnpm 11 then exposed every latent crack by tightening previously-loose behaviors (strict lockfile/overrides matching, hard errors on ignored build scripts, moving `onlyBuiltDependencies` into `pnpm-workspace.yaml`). The fix wasn't a code change; it was unifying *all* developer tool version pinning under a single source of truth so that "what versions does this repo run on?" has exactly one answer for both humans and CI.

## Guidance

**Pin every developer tool — language runtime and package manager alike — in one file: `mise.toml` at the repo root. Treat that file as the only legitimate answer to "what versions does this project use?"**

`mise.toml` (repo root):

```toml
[tools]
node = "22"
"npm:pnpm" = "11.0.9"
```

Key quirks worth memorizing:

- Use the `npm:pnpm` prefix to force the npm backend. The default `aqua:pnpm/pnpm` backend is broken on macOS as of this writing — it looks for assets named `pnpm-macos-arm64` but pnpm publishes `pnpm-darwin-arm64`. The error looks like:

  ```
  Failed to install aqua:pnpm/pnpm@11.0.9: no asset found: pnpm-macos-arm64, pnpm-macos-universal
  ```

- Once `mise.toml` exists, contributors run `mise install` once and the shell auto-swaps versions on `cd` into the repo (assuming `mise activate` is in their shell rc).
- Delete `.nvmrc`. Remove `"packageManager"` from `package.json`. Do *not* tell contributors to `npm i -g pnpm` or `corepack prepare pnpm@... --activate` — those reintroduce competing sources of truth.

**Mirror the exact same pin in CI** using `jdx/mise-action`, which reads the same `mise.toml`:

```yaml
- name: Setup mise
  uses: jdx/mise-action@v2
  with:
    cache: true
```

That single step replaces the usual `pnpm/action-setup@v4` + `actions/setup-node@v4` pair. Local dev and CI now provision identical toolchains from the same file.

**For pnpm 11 specifically**, two related migrations are mandatory and belong in their own places (not `package.json`):

`pnpm-workspace.yaml` (created automatically by `pnpm approve-builds --all`):

```yaml
allowBuilds:
  '@biomejs/biome': true
  '@tailwindcss/oxide': true
  esbuild: true
  sharp: true
```

And remove the legacy `pnpm` block (`overrides`, `onlyBuiltDependencies`) from `package.json` — pnpm 11 honors `pnpm-workspace.yaml` for these and will error on mismatches with the lockfile.

## Why This Matters

Every additional tool-version mechanism in a repo is a silent disagreement waiting to happen. `.nvmrc` is read by nvm but ignored by Volta. `packageManager` is read by corepack — but corepack isn't bundled by Homebrew Node anymore, so contributors get "corepack not found". A global `npm i -g pnpm` works on the installer's machine and breaks for everyone else when the package manager version drifts. CI typically ignores all of this and pins versions in workflow YAML, so green CI tells you nothing about whether a new contributor can `pnpm install` on their laptop.

The real cost shows up as the onboarding experience: a brand-new contributor spends an afternoon fighting `[ERR_PNPM_LOCKFILE_CONFIG_MISMATCH]`, then `[ERR_PNPM_IGNORED_BUILDS]`, then "corepack not found", before touching a single line of product code. Multiply that by every contributor, every onboarding, every pnpm upgrade, every macOS update that breaks Homebrew Node.

Unifying under `mise.toml`:

- Collapses N tool managers into 1 file with N lines.
- Makes local and CI provably identical (same file, same resolver).
- Survives major pnpm upgrades — bumping `"npm:pnpm" = "11.0.9"` to `"11.1.0"` is a one-line PR and everyone's shell picks it up on next `cd`.
- Removes the entire class of "works on my machine" toolchain bugs from code review.

## When to Apply

- Starting any new repo — adopt `mise.toml` before the second contributor.
- Onboarding hits friction more than once on toolchain (not app code).
- The repo has any combination of `.nvmrc`, `packageManager`, Volta config, or "install pnpm globally" in its README.
- CI and local install the same tools through different paths.
- About to upgrade a package manager across a major version that tightens install semantics (pnpm 10→11, npm 9→10, etc.) — fix the pinning story first.
- You catch yourself writing onboarding docs that say "if you have X, do Y; otherwise do Z" — that branching is a smell; collapse it with mise.

## Examples

**Before — the messy state that broke onboarding:**

- `.nvmrc`:

  ```
  22
  ```

- `package.json`:

  ```json
  {
    "packageManager": "pnpm@11.0.9",
    "pnpm": {
      "overrides": { "sharp": "^0.34.2" },
      "onlyBuiltDependencies": ["@biomejs/biome", "@tailwindcss/oxide", "esbuild", "sharp"]
    },
    "scripts": { "build": "astro build" },
    "dependencies": { "@astrojs/vercel": "^8.2.7" }
  }
  ```

- A conflicting *global* `~/.config/mise/config.toml` pinning Node 24.
- CI using `pnpm/action-setup@v4` + `actions/setup-node@v4` with versions specified inline.
- README full of upstream cactus-theme instructions, none specific to the repo.

Symptoms hit, in order:

1. `pnpm install` → `[ERR_PNPM_LOCKFILE_CONFIG_MISMATCH] Cannot proceed with the frozen installation. The current "overrides" configuration doesn't match the value found in the lockfile`
2. After regenerating the lockfile: `pnpm install` → `[ERR_PNPM_IGNORED_BUILDS]` (pnpm 11 errors instead of warning, even for deps already listed in `onlyBuiltDependencies`)
3. `corepack prepare pnpm@11.0.9 --activate` → `corepack: command not found` (Homebrew Node no longer ships corepack)
4. Suggested workaround `npm i -g pnpm@11.0.9` works but reintroduces yet another tool-version source — confusing for deps to come from different places.

**After — single source of truth:**

- `mise.toml` (new):

  ```toml
  [tools]
  node = "22"
  "npm:pnpm" = "11.0.9"
  ```

- `pnpm-workspace.yaml` (new, generated by `pnpm approve-builds --all`):

  ```yaml
  allowBuilds:
    '@biomejs/biome': true
    '@tailwindcss/oxide': true
    esbuild: true
    sharp: true
  ```

- `package.json` — removed `packageManager`, removed the entire `pnpm` block, removed unused `@astrojs/vercel`, changed build script:

  ```json
  "scripts": {
    "build": "SKIP_KEYSTATIC=true astro build"
  }
  ```

  (Keystatic adds SSR routes that require an adapter; gating it keeps the default static build green.)

- `.nvmrc` — deleted.
- `.github/workflows/ci.yml` — replaced the pnpm + node setup pair with:

  ```yaml
  - name: Setup mise
    uses: jdx/mise-action@v2
    with:
      cache: true
  ```

- `README.md` — replaced upstream theme docs with setpiece-specific local dev steps centered on `mise install && pnpm install`.
- Removed the `upstream` git remote (chrismwilliams/astro-theme-cactus) so the repo no longer carries upstream toolchain assumptions.

New contributor flow becomes:

```
git clone …
cd setpiece-site
mise install      # provisions node 22 + pnpm 11.0.9 deterministically
pnpm install
pnpm dev
```

Three commands, zero branching, identical to CI.

## Related

- Commits on `main`: `f8b5082` (pnpm 11 upgrade + Vercel adapter removal), `cc128b7` (mise unification), `2f3cd14` (README rewrite).
