namespace FluentUIIconsLike;

public interface IFluentIconDataProvider
{
    bool TryGetIcon(FluentIconSymbol symbol, FluentIconSize size, FluentIconStyle style, out FluentIconVariantData? data);
}
