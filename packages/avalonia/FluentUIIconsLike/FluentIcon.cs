using System.Collections.Concurrent;
using System.Globalization;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;

namespace FluentUIIconsLike;

public class FluentIcon : Control
{
    public static readonly StyledProperty<FluentIconSymbol> SymbolProperty =
        AvaloniaProperty.Register<FluentIcon, FluentIconSymbol>(nameof(Symbol));

    public static readonly StyledProperty<FluentIconSize> SizeProperty =
        AvaloniaProperty.Register<FluentIcon, FluentIconSize>(nameof(Size), FluentIconSize.Size24);

    public static readonly StyledProperty<FluentIconStyle> StyleProperty =
        AvaloniaProperty.Register<FluentIcon, FluentIconStyle>(nameof(Style), FluentIconStyle.Regular);

    public static readonly StyledProperty<IBrush?> ForegroundProperty =
        AvaloniaProperty.Register<FluentIcon, IBrush?>(nameof(Foreground), Brushes.Black);

    public static readonly StyledProperty<Stretch> StretchProperty =
        AvaloniaProperty.Register<FluentIcon, Stretch>(nameof(Stretch), Stretch.Uniform);

    static readonly ConcurrentDictionary<string, Geometry?> _geometryCache = new();

    Rect _viewBox;
    Geometry? _geometry;
    bool _isError;

    static FluentIcon()
    {
        AffectsRender<FluentIcon>(SymbolProperty, SizeProperty, StyleProperty, ForegroundProperty, StretchProperty, BoundsProperty);
    }

    public FluentIconSymbol Symbol
    {
        get => GetValue(SymbolProperty);
        set => SetValue(SymbolProperty, value);
    }

    public FluentIconSize Size
    {
        get => GetValue(SizeProperty);
        set => SetValue(SizeProperty, value);
    }

    public FluentIconStyle Style
    {
        get => GetValue(StyleProperty);
        set => SetValue(StyleProperty, value);
    }

    public IBrush? Foreground
    {
        get => GetValue(ForegroundProperty);
        set => SetValue(ForegroundProperty, value);
    }

    public Stretch Stretch
    {
        get => GetValue(StretchProperty);
        set => SetValue(StretchProperty, value);
    }

    protected override Size MeasureOverride(Size availableSize)
    {
        var iconSize = GetResolvedSize();
        var width = double.IsNaN(Width) ? iconSize : Width;
        var height = double.IsNaN(Height) ? iconSize : Height;
        return new(width, height);
    }

    protected override void OnPropertyChanged(AvaloniaPropertyChangedEventArgs change)
    {
        ArgumentNullException.ThrowIfNull(change);
        base.OnPropertyChanged(change);

        if (change.Property == SymbolProperty || change.Property == SizeProperty || change.Property == StyleProperty)
            UpdateGeometry();
    }

    public override void Render(DrawingContext context)
    {
        ArgumentNullException.ThrowIfNull(context);
        base.Render(context);

        if (Bounds.Width <= 0 || Bounds.Height <= 0)
            return;

        if (_isError)
        {
            var pen = new Pen(Brushes.Red, 1.5);
            var rect = new Rect(Bounds.Size).Deflate(0.75);
            context.DrawRectangle(null, pen, rect);
            context.DrawLine(pen, rect.TopLeft, rect.BottomRight);
            context.DrawLine(pen, rect.TopRight, rect.BottomLeft);
            return;
        }

        var brush = Foreground;
        if (_geometry is null || brush is null)
            return;

        var sourceSize = _viewBox.Size;
        if (sourceSize.Width <= 0 || sourceSize.Height <= 0)
            return;

        var scale = CalculateScale(Bounds.Size, sourceSize, Stretch);
        var scaledSize = new Size(sourceSize.Width * scale.X, sourceSize.Height * scale.Y);
        var offset = new Vector(
            (Bounds.Width - scaledSize.Width) / 2 - _viewBox.X * scale.X,
            (Bounds.Height - scaledSize.Height) / 2 - _viewBox.Y * scale.Y);

        using var transform = context.PushTransform(Matrix.CreateScale(scale.X, scale.Y) * Matrix.CreateTranslation(offset));
        context.DrawGeometry(brush, null, _geometry);
    }

    protected override void OnAttachedToVisualTree(VisualTreeAttachmentEventArgs e)
    {
        base.OnAttachedToVisualTree(e);
        UpdateGeometry();
    }

    void UpdateGeometry()
    {
        _geometry = null;
        _viewBox = default;
        _isError = false;

        var size = Size == FluentIconSize.None ? FluentIconSize.Size24 : Size;
        if (!FluentIconRegistry.Current.TryGetIcon(Symbol, size, Style, out var data) || data is null)
        {
            _isError = true;
            return;
        }

        _viewBox = ParseViewBox(data.ViewBox);
        _geometry = _geometryCache.GetOrAdd($"{Symbol}:{data.Size}:{data.Style}", _ => Geometry.Parse(data.PathData));
    }

    int GetResolvedSize()
    {
        return Size == FluentIconSize.None ? (int)FluentIconSize.Size24 : (int)Size;
    }

    static Vector CalculateScale(Size targetSize, Size sourceSize, Stretch stretch)
    {
        var scaleX = targetSize.Width / sourceSize.Width;
        var scaleY = targetSize.Height / sourceSize.Height;

        return stretch switch
        {
            Stretch.Fill          => new(scaleX, scaleY),
            Stretch.None          => new(1, 1),
            Stretch.UniformToFill => new(Math.Max(scaleX, scaleY), Math.Max(scaleX, scaleY)),
            _                     => new(Math.Min(scaleX, scaleY), Math.Min(scaleX, scaleY))
        };
    }

    static Rect ParseViewBox(string value)
    {
        var parts = value.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length != 4)
            return new(0, 0, 24, 24);

        return new(
            double.Parse(parts[0], CultureInfo.InvariantCulture),
            double.Parse(parts[1], CultureInfo.InvariantCulture),
            double.Parse(parts[2], CultureInfo.InvariantCulture),
            double.Parse(parts[3], CultureInfo.InvariantCulture));
    }
}
