using System.Collections.Concurrent;
using System.Globalization;
using Avalonia;
using Avalonia.Controls;
using Avalonia.Media;

namespace FluentUIIconsLike;

public class FluentIcon : Control
{
    const string ErrorViewBox = "0 0 24 24";
    const string ErrorPathData = "M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 6.75C12.4142 6.75 12.75 7.08579 12.75 7.5V12.25C12.75 12.6642 12.4142 13 12 13C11.5858 13 11.25 12.6642 11.25 12.25V7.5C11.25 7.08579 11.5858 6.75 12 6.75ZM12 16.25C12.5523 16.25 13 16.6977 13 17.25C13 17.8023 12.5523 18.25 12 18.25C11.4477 18.25 11 17.8023 11 17.25C11 16.6977 11.4477 16.25 12 16.25Z";

    public static readonly StyledProperty<FluentIconSymbol> SymbolProperty =
        AvaloniaProperty.Register<FluentIcon, FluentIconSymbol>(nameof(Symbol));

    public static readonly StyledProperty<int> SizeProperty =
        AvaloniaProperty.Register<FluentIcon, int>(nameof(Size), 24);

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

    public int Size
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
        var width = double.IsNaN(Width) ? Size : Width;
        var height = double.IsNaN(Height) ? Size : Height;
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

        var brush = _isError ? Brushes.Red : Foreground;
        if (_geometry is null || brush is null || Bounds.Width <= 0 || Bounds.Height <= 0)
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

        if (!FluentIconRegistry.Current.TryGetIcon(Symbol, Size, Style, out var data) || data is null)
        {
            _isError = true;
            _viewBox = ParseViewBox(ErrorViewBox);
            _geometry = _geometryCache.GetOrAdd("__error__", _ => Geometry.Parse(ErrorPathData));
            return;
        }

        _viewBox = ParseViewBox(data.ViewBox);
        _geometry = _geometryCache.GetOrAdd($"{Symbol}:{data.Size}:{data.Style}", _ => Geometry.Parse(data.PathData));
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
