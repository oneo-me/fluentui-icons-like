# FluentUI Icons Like

`fluentui-icons-like` is a small monorepo for shipping Microsoft Fluent UI System Icons in practical app-friendly forms.

## Screenshot

![FluentUI Icons Like screenshot](./screenshot.png)

## Packages

| Package | Ecosystem | Status |
| --- | --- | --- |
| `@oneo/fluentui-icons-like` | npm | ![npm version](https://img.shields.io/npm/v/%40oneo%2Ffluentui-icons-like) |
| `ONEO.FluentUIIconsLike` | NuGet | ![NuGet Version](https://img.shields.io/nuget/v/ONEO.FluentUIIconsLike) |
| `ONEO.FluentUIIconsLike.Generator` | NuGet | ![NuGet Version](https://img.shields.io/nuget/v/ONEO.FluentUIIconsLike.Generator) |

## Features

- Fluent UI System Icons for Svelte and Avalonia
- Tree-shakable Svelte components
- Avalonia source generator workflow for referenced symbols
- Shared generator pipeline for icon data

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
- pnpm 10+
- .NET SDK 10.0.0

### Project Structure

```text
.
├── builder/              # icon build and generation scripts
├── packages/
│   ├── svelte/           # Svelte package and preview app
│   └── avalonia/         # Avalonia library, generator, and demo
├── README.md
└── LICENSE
```

## License

MIT
