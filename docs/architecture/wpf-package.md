# Experimental WPF Package

## Scope

`packages/wpf` contains a WPF runtime control, Roslyn source generator, and demo. Package IDs are `ONEO.FluentUIIconsLike.Wpf` and `ONEO.FluentUIIconsLike.Wpf.Generator`.

Runtime and demo target `net9.0-windows`; the analyzer targets `netstandard2.0`. The WPF version baseline is independently set to `2.0.1`. WPF is not a supported automatic release target.

[The builder generator](../../apps/builder/src/generators/wpf.ts) uses the shared scan model and explicitly runs through:

```bash
bun run gen -- wpf
```

It writes Symbol/Style enums and analyzer-embedded icon data. Default generation, root packing, and automatic publication remain limited to Svelte, React, and Avalonia.

## Runtime and analyzer

[The runtime](../../packages/wpf/FluentUIIconsLike/FluentIcon.cs) uses dependency properties for Symbol, Size, Style, Foreground, and Stretch. Defaults are size 24, `Regular`, black, and `Uniform`. It resolves `Size=None` to 24, caches parsed geometry, and renders a red box/cross for missing data.

[The analyzer](../../packages/wpf/FluentUIIconsLike.Generator/Generator.cs) collects assembly-level explicit symbol references, emits a subset provider, and registers it through a module initializer. Variant lookup is exact rather than using Web fallback selection. Like Avalonia, registration replaces a single global provider.

## Known limitations and verification

Prior validation recorded build failures in the source present when documentation was introduced:

- The analyzer's `StreamReader` reference lacks its namespace import.
- Style/Foreground members and dependency-property fields hide inherited members without explicit `new`.
- `MeasureOverride` parameter naming violates CA1725.
- `OnRender` parameter validation violates CA1062.

These are known compile limitations, not evidence that the demo runs. No Windows runtime or visual acceptance is established by this documentation update.

A non-Windows compile attempt can use:

```bash
dotnet build packages/wpf/FluentUIIconsLike.slnx -c Release -p:EnableWindowsTargeting=true
```

Building and running the demo requires Windows for full validation. Workspace TypeScript checks cover the builder generator, not WPF C# compilation. Before promoting WPF to a release target, resolve compilation, verify the demo on Windows, and integrate generation, packing, and publication explicitly.
