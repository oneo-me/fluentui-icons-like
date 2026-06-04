# FluentUI Icons Like

`fluentui-icons-like` is a small monorepo for shipping Microsoft Fluent UI System Icons in practical app-friendly forms.

## Screenshot

![FluentUI Icons Like screenshot](./screenshot.png)

## Packages

| Package | Ecosystem | Status |
| --- | --- | --- |
| `@oneo/fluentui-icons-like` | npm | ![npm version](https://img.shields.io/npm/v/%40oneo%2Ffluentui-icons-like) |
| `@oneo/fluentui-icons-like-react` | npm | ![npm version](https://img.shields.io/npm/v/%40oneo%2Ffluentui-icons-like-react) |
| `ONEO.FluentUIIconsLike` | NuGet | ![NuGet Version](https://img.shields.io/nuget/v/ONEO.FluentUIIconsLike) |
| `ONEO.FluentUIIconsLike.Generator` | NuGet | ![NuGet Version](https://img.shields.io/nuget/v/ONEO.FluentUIIconsLike.Generator) |

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
pnpm add @oneo/fluentui-icons-like
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
pnpm add @oneo/fluentui-icons-like-react
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

- Node.js 22+
- pnpm 11+
- .NET SDK 10.0.0

Install Node dependencies from the repository root:

```bash
pnpm install
```

The root workspace manages all Node packages. Use the root lockfile and avoid installing dependencies from individual package directories.

### Project Structure

```text
.
├── pnpm-workspace.yaml   # pnpm workspace packages and build approvals
├── package.json          # root scripts for workspace checks and generation
├── biome.jsonc           # shared formatter and linter configuration
├── apps/
│   ├── builder/          # icon build and generation scripts
│   └── preview/          # React + TanStack Router preview app
├── packages/
│   ├── svelte/           # Svelte package
│   ├── react/            # React package
│   └── avalonia/         # Avalonia library, generator, and demo
├── README.md
└── LICENSE
```

### Generator Targets

The builder generates framework-specific artifacts from `.cache/source/assets`:

```bash
pnpm run generate:svelte
pnpm run generate:react
pnpm run generate:avalonia
```

The React generator also writes the preview metadata used by `apps/preview`.

Run all Node package checks from the repository root:

```bash
pnpm run check
```

## License

MIT
