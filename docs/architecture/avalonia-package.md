# Avalonia Package

## Runtime and analyzer

- `ONEO.FluentUIIconsLike` supplies the `FluentIcon` control, Symbol/Size/Style types, data interfaces, and global registry.
- `ONEO.FluentUIIconsLike.Generator` is a Roslyn incremental generator referenced as an analyzer. It embeds the supported dataset and emits an application-specific subset.

The runtime targets .NET 10 and Avalonia 12. The analyzer targets `netstandard2.0` and does not declare AOT compatibility. Runtime build configuration enables nullable analysis, deterministic output, analyzers, and warnings as errors.

## Explicit references and registration

Consumers declare assembly-level `FluentIconReferencesAttribute` entries containing `FluentIconSymbol` values. [The analyzer](../../packages/avalonia/FluentUIIconsLike.Generator/Generator.cs) gathers all arguments, deduplicates and sorts symbol names, selects records from embedded `fluent-icons.json`, and emits an `IFluentIconDataProvider`.

A module initializer installs the provider in `FluentIconRegistry.Current`. This is a single replaceable provider slot, not a merged per-assembly registry. Generated registration also exposes a `Register()` method.

Missing referenced data reports `FIL001` as a warning. No declared symbols reports `FIL002` as information and produces an empty provider.

[The builder generator](../../apps/builder/src/generators/avalonia.ts) accepts SVG variants composed of paths and nested groups, converting them to geometry path data. Variants using unsupported SVG elements are omitted. An icon with no supported variants is excluded from the Symbol enum and embedded data.

## Rendering contract

[FluentIcon](../../packages/avalonia/FluentUIIconsLike/FluentIcon.cs) uses styled properties `Symbol`, `Size`, `Style`, `Foreground`, and `Stretch`.

Defaults are size 24, `Regular`, black foreground, and `Uniform` stretch. `Size=None` resolves to 24 for measurement and lookup. The provider requires an exact size/style match; Web fallback rules do not apply.

The control parses viewBox and path geometry, caches geometry by Symbol/actual Size/Style, and centers it within Bounds according to Stretch. Missing data renders a red box and cross, exposing missing references or unsupported combinations. A null foreground does not draw geometry.

The XML namespace is `https://github.com/oneo-me/fluentui-icons-like`, conventionally using the `icons` prefix.

## Locations and verification

Runtime, analyzer, and demo live under `packages/avalonia`. See [README integration](../../README.md#avalonia) for analyzer references and assembly attributes.

After changing the generator, run `bun run gen -- avalonia` and build:

```bash
dotnet build packages/avalonia/FluentUIIconsLike.slnx -c Release
```

Compilation verifies source integration, not visual acceptance. Check declared and undeclared symbols, exact variant lookup, Stretch, and error rendering in the demo or a consuming application. [Local packing](build-pipeline.md#local-packing) covers both NuGet archives.
