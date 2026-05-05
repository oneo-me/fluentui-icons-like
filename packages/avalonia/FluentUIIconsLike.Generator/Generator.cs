using System.Collections.Immutable;
using System.Reflection;
using System.Text;
using System.Text.Json;
using Microsoft.CodeAnalysis;

namespace FluentUIIconsLike.Generator;

[Generator]
sealed class Generator : IIncrementalGenerator
{
    const string ReferenceAttributeName = "FluentUIIconsLike.FluentIconReferencesAttribute";
    const string IconDataFileName = "fluent-icons.json";

    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        var requestedSymbols = context.SyntaxProvider
            .ForAttributeWithMetadataName(
                ReferenceAttributeName,
                static (_, _) => true,
                static (syntaxContext, _) => CollectRequestedSymbols(syntaxContext))
            .Collect()
            .Select(static (items, _) => items.SelectMany(static x => x).Distinct().OrderBy(static x => x, StringComparer.Ordinal).ToImmutableArray());

        context.RegisterSourceOutput(requestedSymbols, static (productionContext, symbols) =>
        {
            var generated = EmitSource(IconDataCache.Instance, symbols, productionContext.ReportDiagnostic);
            productionContext.AddSource("FluentIconDataProvider.g.cs", generated);
        });
    }

    static ImmutableArray<string> CollectRequestedSymbols(GeneratorAttributeSyntaxContext context)
    {
        var builder = ImmutableArray.CreateBuilder<string>();

        foreach (var attribute in context.Attributes)
        foreach (var argument in attribute.ConstructorArguments)
        {
            if (argument.Kind == TypedConstantKind.Array)
            {
                foreach (var value in argument.Values)
                    AddSymbol(builder, value);

                continue;
            }

            AddSymbol(builder, argument);
        }

        return builder.ToImmutable();
    }

    static void AddSymbol(ImmutableArray<string>.Builder builder, TypedConstant argument)
    {
        if (argument.Type?.TypeKind == TypeKind.Enum)
        {
            var enumName = TryGetEnumMemberName(argument);
            if (enumName is not null && enumName.Length > 0)
                builder.Add(enumName);

            return;
        }

        if (argument.Value is null)
            return;

        var value = argument.Value.ToString();
        if (!string.IsNullOrWhiteSpace(value))
            builder.Add(value);
    }

    static string EmitSource
    (
        ImmutableDictionary<string, IconRecord> allIcons,
        ImmutableArray<string> requestedSymbols,
        Action<Diagnostic> reportDiagnostic
    )
    {
        var selected = new List<KeyValuePair<string, IconRecord>>();

        foreach (var symbol in requestedSymbols)
        {
            if (allIcons.TryGetValue(symbol, out var record))
            {
                selected.Add(new(symbol, record));
                continue;
            }

            reportDiagnostic(Diagnostic.Create(
                _missingIconDescriptor,
                Location.None,
                symbol));
        }

        if (requestedSymbols.Length == 0)
            reportDiagnostic(Diagnostic.Create(_noReferencesDescriptor, Location.None));

        var entries = string.Join(
            "\n",
            selected.Select(static pair => BuildIconEntry(pair.Key, pair.Value)));

        return $$"""
                 #nullable enable
                 namespace FluentUIIconsLike.Generated;

                 using System.Collections.Generic;
                 using System.Runtime.CompilerServices;

                 file sealed class GeneratedFluentIconDataProvider : global::FluentUIIconsLike.IFluentIconDataProvider
                 {
                     private static readonly Dictionary<global::FluentUIIconsLike.FluentIconSymbol, global::FluentUIIconsLike.FluentIconData> Map = new()
                     {
                 {{entries}}
                     };

                     public bool TryGetIcon(global::FluentUIIconsLike.FluentIconSymbol symbol, int size, global::FluentUIIconsLike.FluentIconStyle style, out global::FluentUIIconsLike.FluentIconVariantData? data)
                     {
                         data = null;
                         if (!Map.TryGetValue(symbol, out var iconData))
                         {
                             return false;
                         }

                         foreach (var variant in iconData.Variants)
                         {
                             if (variant.Size == size && variant.Style == style)
                             {
                                 data = variant;
                                 return true;
                             }
                         }

                         return false;
                     }
                 }

                 public static class FluentIconGeneratedRegistration
                 {
                     public static void Register()
                     {
                         global::FluentUIIconsLike.FluentIconRegistry.Current = new GeneratedFluentIconDataProvider();
                     }

                     [ModuleInitializer]
                     internal static void Initialize()
                     {
                         Register();
                     }
                 }
                 """;
    }

    static string? TryGetEnumMemberName(TypedConstant argument)
    {
        if (argument.Type is not INamedTypeSymbol enumType || argument.Value is null)
            return null;

        foreach (var member in enumType.GetMembers().OfType<IFieldSymbol>())
        {
            if (!member.HasConstantValue || member.ConstantValue is null)
                continue;

            if (Equals(member.ConstantValue, argument.Value))
                return member.Name;
        }

        return null;
    }

    static string Escape(string value)
    {
        return value.Replace("\\", @"\\").Replace("\"", "\\\"");
    }

    static string BuildIconEntry(string symbol, IconRecord record)
    {
        var variants = string.Join(
            "\n",
            record.Variants.Select(static variant =>
                $"                new global::FluentUIIconsLike.FluentIconVariantData({variant.Size}, global::FluentUIIconsLike.FluentIconStyle.{variant.Style}, \"{Escape(variant.ViewBox)}\", \"{Escape(variant.PathData)}\"),"));

        return
            $"            [global::FluentUIIconsLike.FluentIconSymbol.{symbol}] = new global::FluentUIIconsLike.FluentIconData(new global::FluentUIIconsLike.FluentIconVariantData[]\n" +
            "            {\n" +
            variants +
            "\n            }),";
    }

    static readonly DiagnosticDescriptor _missingIconDescriptor = new(
        "FIL001",
        "Missing fluent icon data",
        "Fluent icon '{0}' was referenced but no generated data was found",
        "FluentUIIconsLike",
        DiagnosticSeverity.Warning,
        true);

    static readonly DiagnosticDescriptor _noReferencesDescriptor = new(
        "FIL002",
        "No fluent icon references declared",
        "No FluentIconReferencesAttribute entries were found. The generated provider will be empty.",
        "FluentUIIconsLike",
        DiagnosticSeverity.Info,
        true);

sealed class IconRecord(string symbol, List<IconVariantRecord>? variants)
{
    public string Symbol { get; } = symbol;

        public IReadOnlyList<IconVariantRecord> Variants { get; } = variants ?? new List<IconVariantRecord>();
    }

    sealed class IconVariantRecord(int size, string style, string viewBox, string pathData)
    {
        public int Size { get; } = size;

        public string Style { get; } = style;

        public string ViewBox { get; } = viewBox;

        public string PathData { get; } = pathData;
    }

    static class IconDataCache
    {
        public static ImmutableDictionary<string, IconRecord> Instance { get; } = Load();

        static ImmutableDictionary<string, IconRecord> Load()
        {
            var assembly = typeof(Generator).GetTypeInfo().Assembly;
            var resourceName = assembly.GetManifestResourceNames()
                .FirstOrDefault(static name => name.EndsWith(IconDataFileName, StringComparison.OrdinalIgnoreCase));

            if (resourceName is null)
                return ImmutableDictionary<string, IconRecord>.Empty;

            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream is null)
                return ImmutableDictionary<string, IconRecord>.Empty;

            using var reader = new StreamReader(stream, Encoding.UTF8, true);
            var content = reader.ReadToEnd();
            if (string.IsNullOrWhiteSpace(content))
                return ImmutableDictionary<string, IconRecord>.Empty;

            using var document = JsonDocument.Parse(content);
            if (document.RootElement.ValueKind != JsonValueKind.Array)
                return ImmutableDictionary<string, IconRecord>.Empty;

            var builder = ImmutableDictionary.CreateBuilder<string, IconRecord>(StringComparer.Ordinal);

            foreach (var recordElement in document.RootElement.EnumerateArray())
            {
                var record = ParseIconRecord(recordElement);
                if (string.IsNullOrWhiteSpace(record.Symbol))
                    continue;

                builder[record.Symbol] = record;
            }

            return builder.ToImmutable();
        }

        static IconRecord ParseIconRecord(JsonElement element)
        {
            var symbol = GetString(element, "symbol");
            var variants = new List<IconVariantRecord>();

            if (element.TryGetProperty("variants", out var variantsElement) && variantsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var variantElement in variantsElement.EnumerateArray())
                    variants.Add(ParseIconVariantRecord(variantElement));
            }

            return new IconRecord(symbol, variants);
        }

        static IconVariantRecord ParseIconVariantRecord(JsonElement element)
        {
            var size = 0;
            if (element.TryGetProperty("size", out var sizeElement) && sizeElement.TryGetInt32(out var parsedSize))
                size = parsedSize;

            return new IconVariantRecord(
                size,
                GetString(element, "style"),
                GetString(element, "viewBox"),
                GetString(element, "pathData"));
        }

        static string GetString(JsonElement element, string propertyName)
        {
            return element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String
                ? property.GetString() ?? string.Empty
                : string.Empty;
        }
    }
}
