# FluentUI Icons Like

`fluentui-icons-like` is a small monorepo for shipping Microsoft Fluent UI System Icons in practical app-friendly forms.

## Screenshot

![FluentUI Icons Like screenshot](./screenshot.png)

## Packages

| Package                            | Ecosystem | Version                                                                           |
| ---------------------------------- | --------- | --------------------------------------------------------------------------------- |
| `@oneo/fluentui-icons-like`        | npm       | ![npm version](https://img.shields.io/npm/v/%40oneo%2Ffluentui-icons-like)        |
| `@oneo/fluentui-icons-like-react`  | npm       | ![npm version](https://img.shields.io/npm/v/%40oneo%2Ffluentui-icons-like-react)  |
| `ONEO.FluentUIIconsLike`           | NuGet     | ![NuGet Version](https://img.shields.io/nuget/v/ONEO.FluentUIIconsLike)           |
| `ONEO.FluentUIIconsLike.Generator` | NuGet     | ![NuGet Version](https://img.shields.io/nuget/v/ONEO.FluentUIIconsLike.Generator) |

## Features

- Fluent UI System Icons for Svelte, React, and Avalonia
- Tree-shakable Svelte components
- Tree-shakable React SVG components
- Avalonia source generator workflow for referenced symbols
- Shared generator pipeline for icon data
- React + TanStack Router preview app for browsing and exporting icons

## Quick Use

### Svelte

Install the package:

```bash
bun add @oneo/fluentui-icons-like
```

Use icons in a Svelte component:

```svelte
<script lang="ts">
  import FluentIconAccessTime from '@oneo/fluentui-icons-like/FluentIconAccessTime.svelte';
  import FluentIconAccessibility from '@oneo/fluentui-icons-like/FluentIconAccessibility.svelte';
  import FluentIconAdd from '@oneo/fluentui-icons-like/FluentIconAdd.svelte';
</script>

<div style="display:flex;gap:12px;align-items:center;">
  <FluentIconAccessTime size={24} style="Regular" />
  <FluentIconAccessibility size={24} style="Filled" />
  <FluentIconAdd size={20} style="Regular" />
</div>
```

### React

Install the package:

```bash
bun add @oneo/fluentui-icons-like-react
```

Use icons in a React component:

```tsx
import FluentIconAccessTime from '@oneo/fluentui-icons-like-react/FluentIconAccessTime';
import FluentIconAccessibility from '@oneo/fluentui-icons-like-react/FluentIconAccessibility';
import FluentIconAdd from '@oneo/fluentui-icons-like-react/FluentIconAdd';

export function Example() {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <FluentIconAccessTime size={24} variant="Regular" />
      <FluentIconAccessibility size={24} variant="Filled" />
      <FluentIconAdd size={20} variant="Regular" />
    </div>
  );
}
```

React icons accept standard SVG attributes plus `size`, `variant`, and `title`.
Set `title={null}` to omit the generated SVG title element.

### Avalonia

Install the packages:

```bash
dotnet add package ONEO.FluentUIIconsLike
dotnet add package ONEO.FluentUIIconsLike.Generator
```

Reference the source generator as an analyzer in your project file:

```xml
<ItemGroup>
  <PackageReference Include="ONEO.FluentUIIconsLike" Version="2.0.0-preview.0" />
  <PackageReference Include="ONEO.FluentUIIconsLike.Generator" Version="2.0.0-preview.0" PrivateAssets="all" />
</ItemGroup>
```

Add `FluentIconReferences` to list the icons your app uses. The source generator builds icon data from these references:

```csharp
using FluentUIIconsLike;

[assembly: FluentIconReferences(
    FluentIconSymbol.AccessTime,
    FluentIconSymbol.Accessibility,
    FluentIconSymbol.Add)]
```

Use the icon control in `axaml`:

```xml
<Window xmlns="https://github.com/avaloniaui"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        xmlns:icons="https://github.com/oneo-me/fluentui-icons-like">
  <StackPanel Spacing="12">
    <icons:FluentIcon Symbol="AccessTime" Size="Size24" Style="Regular" Foreground="DodgerBlue" />
    <icons:FluentIcon Symbol="Accessibility" Size="Size24" Style="Filled" Foreground="MediumSeaGreen" />
  </StackPanel>
</Window>
```

## Contributing

### Environment

- Bun 1.4.2 (runtime and package manager)
- Wrangler 4
- .NET SDK 10.0.0

Install workspace dependencies from the repository root:

```bash
bun install
```

The root workspace manages all Node packages. Use the root lockfile and avoid installing dependencies from individual package directories.

### Project Structure

```text
.
├── bun.lock              # shared workspace dependency lockfile
├── bunfig.toml           # Bun runtime configuration
├── package.json          # root scripts for preview dev, deployment, checks, sync, generation, and packing
├── wrangler.jsonc        # Cloudflare Workers Assets config for preview deployment
├── .oxlintrc.json        # shared Oxlint rules
├── .oxfmtrc.json         # shared Oxfmt rules
├── apps/
│   ├── builder/          # icon build and generation scripts
│   └── preview/          # React + TanStack Router preview app
├── packages/
│   ├── svelte/           # Svelte package
│   ├── react/            # React package
│   ├── avalonia/         # Avalonia library, generator, and demo
│   └── wpf/              # experimental WPF library, generator, and demo
├── docs/architecture/    # mechanism-specific documentation
├── AGENTS.md             # contributor instructions
├── ARCHITECTURE.md       # system overview and subject index
├── CHANGELOG.md          # user-facing release notes
├── README.md
└── LICENSE
```

### Workspace Scripts

Oxlint handles linting and Oxfmt handles formatting. The root configurations exclude generated icons, third-party UI primitives, and Avalonia files. `bun run check` applies lint fixes and formatting before checking package types; `bun run check:ci` validates without writing files. React Compiler-specific lint checks are disabled while the preview uses the regular React plugin. The recommended Oxc editor extension formats on save.

The root scripts expose the main workspace tasks:

```bash
bun run dev
bun run build
bun run deploy
bun run check
bun run check:ci
bun run lint
bun run format
bun run test
bun run sync
bun run gen
bun run gen -- svelte
bun run gen -- react
bun run gen -- avalonia
bun run pack
```

`bun run deploy` builds the React preview app and deploys `apps/preview/dist` with Wrangler. The root `wrangler.jsonc` uses Workers Assets in static SPA mode, so unmatched navigation requests are served by `index.html`.

`bun run gen` writes all generated package artifacts, including the preview icon metadata at `apps/preview/src/preview/icons.json`. Pass a generator name to limit output to one target.

The builder, React package, and preview use TypeScript 7. The Svelte package uses TypeScript 6 because `svelte-check` and `svelte-package` require the JavaScript compiler API.

`apps/builder` runs TypeScript source directly with Bun. Workspace packages are defined in the root `package.json`; `trustedDependencies` authorizes dependency install scripts, and `bunfig.toml` makes Bun the runtime for package scripts and their CLI tools.

The React generator also writes the preview metadata used by `apps/preview`.

`apps/preview` uses shadcn/ui with Tailwind CSS 4. The app-local UI primitives live in `apps/preview/src/components/ui`, are configured by `apps/preview/components.json`, and are installed with the shadcn CLI, for example `bunx --bun shadcn@latest add button`.

`apps/preview/src/styles.css` is reserved for Tailwind/shadcn imports, design tokens, base rules, and shared keyframes. Component-specific layout, state, and responsive styling belong in the relevant React component as Tailwind classes.

The preview icon catalog uses `@tanstack/react-virtual` for row virtualization. The catalog owns viewport measurement and derives tile size, columns, and row height from the selected icon size and display scale.

### Automatic Upstream Releases

`.github/workflows/upstream-release.yml` checks daily at 03:23 UTC. A new release is eligible 30 days after the last successful automatic release and is published only when the upstream `assets` tree changes. The first run is eligible immediately. Manual runs use the same interval and recovery rules.

The workflow clones the public upstream over HTTPS, generates all targets from the same commit, checks the workspace packages, builds the preview and Avalonia solution, and packs all four packages. It chooses the next shared patch version above the root version, stable registry versions, and existing GitHub tags/releases. Package versions are updated in the build workspace; the root version in the default branch remains the local packing baseline.

Before publishing, all four archives and their checksums are saved in a GitHub Release draft. Failed package publication resumes from those exact archives on the next run, without rebuilding or choosing a new version. Existing npm versions must match the saved archive's integrity. The Release becomes public only after all four packages have been accepted. npm and NuGet publication is sequential, so partial availability is possible until a retry succeeds. A draft with missing or damaged assets stops publication and requires restoring its original assets.

One-time setup:

1. Add the Actions secret `NPM_TOKEN`, with publish access to **both** npm packages and permission to publish without an interactive 2FA prompt. The workflow passes it to [Bun publishing](https://bun.com/docs/pm/cli/publish) as `NPM_CONFIG_TOKEN`. Renew it before expiry.
2. Add the Actions secret `NUGET_API_KEY`, scoped to publish both NuGet package IDs. Renew it before expiry.
3. Put the workflow on the default branch and enable GitHub Actions. `GITHUB_TOKEN` needs the workflow's `contents: write` permission to create releases and upload archives.

The preview is built as a validation step; Cloudflare deployment remains independent. Generated files and version changes are included in published archives, while GitHub release tags identify the generator source commit and the release body identifies the upstream commit.

[GitHub scheduled workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule) can be delayed and are disabled in public repositories after 60 days without repository activity. This automation therefore depends on the schedule remaining enabled; it is not an exact-time timer. Run `bun run test` to check interval, version selection, metadata validation, draft recovery, registry failures, and publication requests against mocked services without publishing.

### Experimental WPF Support

This repository includes an experimental WPF runtime, source generator, and demo under `packages/wpf`. Generate its icon data with `bun run gen -- wpf`. Default generation, packing, and automatic releases still target Svelte, React, and Avalonia; WPF is not automatically published. Known compilation limitations and Windows validation requirements are documented in [WPF package](docs/architecture/wpf-package.md).

## License

MIT

## Project Documentation

Read [Architecture](ARCHITECTURE.md) for the system overview and subject index. See [Project Documentation](docs/README.md) for navigation, [Contributor Instructions](AGENTS.md) for maintenance rules, and [Changelog](CHANGELOG.md) for release notes.
