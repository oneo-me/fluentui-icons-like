namespace FluentUIIconsLike;

public static class FluentIconRegistry
{
    public static IFluentIconDataProvider Current { get; set; } = EmptyFluentIconDataProvider.Instance;

    sealed class EmptyFluentIconDataProvider : IFluentIconDataProvider
    {
        public static EmptyFluentIconDataProvider Instance { get; } = new();

        public bool TryGetIcon(FluentIconSymbol symbol, int size, FluentIconStyle style, out FluentIconVariantData? data)
        {
            data = null;
            return false;
        }
    }
}
