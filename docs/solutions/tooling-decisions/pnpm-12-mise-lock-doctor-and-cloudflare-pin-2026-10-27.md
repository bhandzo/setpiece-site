---
title: pnpm 12 upgrade, mise.lock, mise doctor checks, and pinning Cloudflare Pages' pnpm
date: 2026-10-27
category: tooling-decisions
module: setpiece-site
problem_type: tooling_decision
component: tooling
severity: medium
related_components:
  - development_workflow
  - ci
  - deployment
applies_when:
  - "Upgrading a mise-pinned pnpm repo from pnpm 11 to 12 (softcopy, extra_point next)"
  - "Adopting mise.lock or `mise doctor project` checks"
  - "A Cloudflare Pages build must run the same pnpm as local dev and CI"
tags:
  - mise
  - pnpm
  - cloudflare-pages
  - lockfile
  - ci
---

# pnpm 12, mise.lock, doctor checks, and Cloudflare's pnpm

Builds on [mise as the single source of truth](./mise-as-single-source-of-truth-for-node-and-pnpm-2026-05-11.md). mise stays the source of truth; this note adds one mirrored field for Cloudflare and the checks that keep it honest.

## Playbook (repeat per repo)

1. `mise.toml`: bump `"npm:pnpm"` to the latest 12.x and add `[settings] lockfile = true`.
2. `mise lock --platform linux-x64,macos-arm64` → commit `mise.lock` **and** `.mise/locks/` (the npm backend's sidecar lock, see below).
3. `package.json`: add `"packageManager": "pnpm@<same version>"` (only if the repo builds anywhere mise doesn't run, such as Cloudflare Pages).
4. `pnpm install` → commit `pnpm-lock.yaml` (it gains a `packageManagerDependencies` document).
5. Clean `pnpm-workspace.yaml` (see gotchas), add the `[doctor.checks.*]` below, and bump CI to `jdx/mise-action@v5` + `mise doctor project`.
6. Run `pnpm install`, then check, test and build. Push, then confirm the Cloudflare preview deploy.

## pnpm 11 → 12: what actually mattered

The [12.0.0 release notes](https://github.com/pnpm/pnpm/releases/tag/v12.0.0) list several majors. For this repo only these mattered:

- **Unknown `pnpm-workspace.yaml` keys are now hard errors** (`ERR_PNPM_UNRECOGNIZED_WORKSPACE_SETTINGS`) when `packageManager` pins a version the running pnpm satisfies. Otherwise they are only a warning. Adding `packageManager` therefore turns typos and stale keys into failures. `onlyBuiltDependencies` is still recognised by 12.15.0. We deleted it anyway, because it only existed as a mirror for Cloudflare's pnpm 10.
- **`--frozen-lockfile false` was removed.** Use `--no-frozen-lockfile`. Grep the CI and scripts for it.
- **Adding `packageManager` changes the lockfile.** pnpm writes a leading YAML document with `packageManagerDependencies` (pnpm plus its per-platform `@pnpm/exe.*` binaries). Until you run a non-frozen `pnpm install`, a frozen install fails with `ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE`. The rest of the lockfile was byte-identical. `lockfileVersion` stays `'9.0'`.
- pnpm 12 is a native binary. The npm `pnpm` package pulls in `@pnpm/exe.<platform>`. mise's npm backend handles this.
- These changes didn't affect this repo: git deps are now host-canonical HTTPS, cycle-breaking is canonical, `engineStrict` is stricter through optional subtrees, and `auto` now tries hardlinks first on Linux.

## How Cloudflare Pages picks pnpm (and how it's now pinned)

- The v3 build image ships **pnpm 10.11.1** by default. The only documented override is the `PNPM_VERSION` env var. It lives in the dashboard, so it drifts out of view. Cloudflare does **not** read `mise.toml`, and it does not infer the version from `pnpm-lock.yaml` ([docs](https://developers.cloudflare.com/pages/configuration/build-image/)).
- **What works:** pnpm ≥10 has `managePackageManagerVersions` on by default. Cloudflare's pnpm 10 reads `packageManager: pnpm@12.15.0`, downloads that version and hands off to it. No corepack is involved, so the old "corepack not found" objection to `packageManager` doesn't apply.
- **Verified empirically on PR #19.** We can't read the Cloudflare build logs (wrangler is logged into a different account). Instead, a temporary build script ran `grep -q pnpm@12.15.0 node_modules/.modules.yaml && astro build`, and Cloudflare deployed. A negative control (`grep -q pnpm@10.`) failed the deploy, which proves the guard really ran.
- **Drift:** `packageManager` is a mirror of the mise pin, not a second source. The `pnpm-matches-package-manager` doctor check fails CI when the two disagree. Cloudflare's **Node** is still its image default (22.23.4 today, matching `mise.lock`). It is unpinned. If it drifts, pin it with `NODE_VERSION` in the dashboard.

## mise.lock

- Enable it with `[settings] lockfile = true` in `mise.toml`. Without this, mise only updates an existing lockfile and never creates one. Generate the lockfile with `mise lock --platform linux-x64,macos-arm64`.
- For core `node`, it records the exact version plus a URL and sha256 per platform.
- For `npm:` tools, mise uses an embedded `aube` resolver. It records a digest pointing at `.mise/locks/npm-<tool>/<version>/aube-lock.yaml`, which holds the tool's full dependency graph. **Commit `.mise/locks/`.**
- `jdx/mise-action` automatically runs `mise install --locked` when `mise.lock` exists. CI log: `Detected a mise lock file, running mise install --locked`.
- **Local gotcha:** a plain `mise install --locked` also applies to your *global* tools. It fails on any that aren't in the project lock (`usage@latest is not in the lockfile`). Name the project's tools instead, such as `mise install --locked node npm:pnpm osv-scanner`. CI has no global config, so this doesn't bite there.
- **Bumping** (verified 2026-10-27 on mise 2026.10.19, for `npm:pnpm` and the aqua-backed `osv-scanner`): run `mise lock <tool>@<x.y.z>`. It rewrites the pin in `mise.toml` and relocks every platform already in `mise.lock`. It also prunes the old version's entry. For `npm:` tools it replaces the old `.mise/locks/npm-<tool>/<version>/` directory with the new one, so commit both the deletion and the addition. For pnpm, then update `packageManager` and run `pnpm install`. The doctor check fails until all three agree. For node (`"22"`), `mise lock --bump` picks up the newest 22.x (untested).
- **Adding a tool:** `mise use <tool>@<x.y.z>` writes the pin and locks it for the existing platforms in one step.

## mise doctor project checks

These are declared in `mise.toml`. They run with the project's tools on PATH and never run automatically, so CI calls `mise doctor project` explicitly:

```toml
[doctor.checks.pnpm-matches-package-manager]
description = "package.json packageManager matches the pnpm pinned in mise.toml"
run = '''test "$(node -p 'require("./package.json").packageManager')" = "pnpm@$(mise current npm:pnpm)"'''
hint = "Set package.json \"packageManager\" to \"pnpm@<the npm:pnpm version in mise.toml>\", then run `pnpm install`."

[doctor.checks.pnpm-lockfile-in-sync]
description = "pnpm-lock.yaml matches package.json and pnpm-workspace.yaml"
run = "pnpm install --frozen-lockfile --lockfile-only"
hint = "Run `pnpm install` and commit pnpm-lock.yaml."
timeout = "60s"
```

- Both checks were confirmed to fail on drift: a changed dependency range, and a mismatched `packageManager`.
- Compare against `mise current`, not `pnpm --version`. When the two differ, pnpm switches itself to the `packageManager` version, so `pnpm --version` would hide exactly the drift the check is meant to catch.
- `run`, `description` and `hint` are templates, so avoid `{{` in shell. Other fields are `timeout` (default 10s), `os`, `depends`, `dir` and `shell`. Unknown fields are errors.
- `mise lock --dry-run` exits 0 even when it would change the lockfile, so it's no use as a check. In CI, `--locked` covers lock coverage.

## jdx/mise-action v2 → v5

v3 exports `[env]` from `mise.toml`. v4 moves the action runtime to Node 24. v5 defaults `minimum_release_age: 24h` for the mise binary. There are no input changes for `cache: true`. It's a drop-in bump.
