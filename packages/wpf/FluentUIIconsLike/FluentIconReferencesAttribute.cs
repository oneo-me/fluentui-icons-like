namespace FluentUIIconsLike;

[AttributeUsage(AttributeTargets.Assembly, AllowMultiple = true)]
public sealed class FluentIconReferencesAttribute(params FluentIconSymbol[] symbols) : Attribute
{
    public IReadOnlyList<FluentIconSymbol> Symbols { get; } = symbols;
}
