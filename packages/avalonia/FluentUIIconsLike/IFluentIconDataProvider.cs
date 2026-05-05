namespace FluentUIIconsLike;

public interface IFluentIconDataProvider
{
    bool TryGetIcon(FluentIconSymbol symbol, int size, FluentIconStyle style, out FluentIconVariantData? data);
}
