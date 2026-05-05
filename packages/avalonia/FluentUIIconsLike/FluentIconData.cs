namespace FluentUIIconsLike;

public sealed record FluentIconData(IReadOnlyList<FluentIconVariantData> Variants);

public sealed record FluentIconVariantData(int Size, FluentIconStyle Style, string ViewBox, string PathData);
