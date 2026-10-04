# Build Pipeline

## Toolchain and ownership

Bun 1.4.2 is the workspace package manager and TypeScript runtime, pinned by `.bun-version` and the root manifest. Workspace membership and trusted installation scripts are declared in `package.json`; `bunfig.toml` selects Bun for scripts and CLI tools. Use the shared root `bun.lock`.

Builder, React, and preview use TypeScript 7. Svelte uses TypeScript 6 because `svelte-check` and `svelte-package` require the JavaScript compiler API. The Web stack includes Svelte 5, React 19 for development, Vite, TanStack Router/Virtual, Tailwind CSS 4, and shadcn/ui. The Avalonia solution targets .NET 10; its analyzer targets `netstandard2.0`.

Oxlint and Oxfmt configurations exclude generated icons, third-party UI primitives, and platform package files. Builder-side generators remain checked. React Compiler-specific lint rules are disabled because the preview uses the regular React plugin.

## Synchronization and scanning

[Sync](../../apps/builder/src/sync.ts) clones the public HTTPS upstream into ignored `.cache/source` with depth 1, or runs `git pull --ff-only` on the existing checkout. No SSH credentials are needed. Scanning reads `.cache/source/assets`.

[The scanner](../../apps/builder/src/scan.ts) reads each directory's `metadata.json` and locates SVG files by declared size and style. For unique directional icons, it can use the metadata singleton suffix. Missing metadata, missing SVGs, and unparseable SVGs are skipped with warnings; icons without sources are omitted. Invalid JSON or an unavailable assets directory fails the command.

SVG parsing produces a viewBox and recursive node tree. Actual source sizes/styles and descriptive metadata form the shared [model](../../apps/builder/src/types.ts). Preferred asset size follows `20, 24, 16, 28, 32, 48, 12`; preferred style is `Regular` when available.

## Generation

[The CLI](../../apps/builder/src/index.ts) scans once before invoking selected generators. An empty scan fails rather than emitting empty packages.

| Command                   | Output                                                               |
| ------------------------- | -------------------------------------------------------------------- |
| `bun run gen`             | Svelte, React, and Avalonia, in that order.                          |
| `bun run gen -- svelte`   | `packages/svelte/src/lib/icons`                                      |
| `bun run gen -- react`    | `packages/react/src/icons` and `apps/preview/src/preview/icons.json` |
| `bun run gen -- avalonia` | Runtime enums and analyzer-embedded `fluent-icons.json`.             |
| `bun run gen -- wpf`      | Experimental WPF enums and analyzer data.                            |

Generation creates or overwrites files but does not clear output directories first. Removing upstream icons can therefore leave stale local modules; automatic release preparation separately clears the generated Web icon directories. Change generators or shared runtimes, not individual derived files.

## Local packing

[The packer](../../apps/builder/src/pack.ts) uses the root manifest version, clears `publish/` and package build outputs, installs root dependencies with `--frozen-lockfile --ignore-scripts`, and synchronizes the two npm manifests and Avalonia `Directory.Build.props`.

It temporarily copies the root README and images into npm package directories, invokes `bun pm pack`, removes those temporary copies, and invokes `dotnet pack` for both Avalonia packages. Four archives end up in `publish/`. Packing does not synchronize upstream or generate icons, and it does not publish to registries. WPF is excluded.

## Development and verification

Run from the repository root:

```bash
bun install --frozen-lockfile
bun run sync
bun run gen
bun run dev
```

| Command                                                            | Coverage and side effects                                                 |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `bun run check:ci`                                                 | Read-only lint, formatting, and builder/Svelte/React/preview type checks. |
| `bun run check`                                                    | Lint fixes and formatting, then the same workspace type checks.           |
| `bun run test`                                                     | Mocked release-automation tests.                                          |
| `bun run build`                                                    | Preview production bundle, not .NET packages.                             |
| `dotnet build packages/avalonia/FluentUIIconsLike.slnx -c Release` | Avalonia runtime, analyzer, and demo compilation.                         |
| `bun run pack`                                                     | Local archive creation; clears outputs and writes package versions.       |
| `bun run deploy`                                                   | Builds preview and deploys via Wrangler; requires Cloudflare access.      |

[Wrangler configuration](../../wrangler.jsonc) serves `apps/preview/dist` as Workers Assets in SPA mode. Unknown navigation requests resolve to `index.html`. Site deployment is independent of [package publication](upstream-release.md).
