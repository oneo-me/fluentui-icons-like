using System.Collections.Concurrent;
using System.Globalization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace FluentUIIconsLike;

public class FluentIcon : Control
{
    public static readonly DependencyProperty SymbolProperty =
        DependencyProperty.Register(
            nameof(Symbol),
            typeof(FluentIconSymbol),
            typeof(FluentIcon),
            new FrameworkPropertyMetadata(
                default(FluentIconSymbol),
                FrameworkPropertyMetadataOptions.AffectsRender | FrameworkPropertyMetadataOptions.AffectsMeasure,
                OnIconPropertyChanged));

    public static readonly DependencyProperty SizeProperty =
        DependencyProperty.Register(
            nameof(Size),
            typeof(FluentIconSize),
            typeof(FluentIcon),
            new FrameworkPropertyMetadata(
                FluentIconSize.Size24,
                FrameworkPropertyMetadataOptions.AffectsRender | FrameworkPropertyMetadataOptions.AffectsMeasure,
                OnIconPropertyChanged));

    public static readonly DependencyProperty StyleProperty =
        DependencyProperty.Register(
            nameof(Style),
            typeof(FluentIconStyle),
            typeof(FluentIcon),
            new FrameworkPropertyMetadata(
                FluentIconStyle.Regular,
                FrameworkPropertyMetadataOptions.AffectsRender | FrameworkPropertyMetadataOptions.AffectsMeasure,
                OnIconPropertyChanged));

    public static readonly DependencyProperty ForegroundProperty =
        DependencyProperty.Register(
            nameof(Foreground),
            typeof(Brush),
            typeof(FluentIcon),
            new FrameworkPropertyMetadata(
                Brushes.Black,
                FrameworkPropertyMetadataOptions.AffectsRender));

    public static readonly DependencyProperty StretchProperty =
        DependencyProperty.Register(
            nameof(Stretch),
            typeof(Stretch),
            typeof(FluentIcon),
            new FrameworkPropertyMetadata(
                Stretch.Uniform,
                FrameworkPropertyMetadataOptions.AffectsRender));

    static readonly ConcurrentDictionary<string, Geometry?> _geometryCache = new();

    Rect _viewBox;
    Geometry? _geometry;
    bool _isError;

    public FluentIconSymbol Symbol
    {
        get => (FluentIconSymbol)GetValue(SymbolProperty);
        set => SetValue(SymbolProperty, value);
    }

    public FluentIconSize Size
    {
        get => (FluentIconSize)GetValue(SizeProperty);
        set => SetValue(SizeProperty, value);
    }

    public FluentIconStyle Style
    {
        get => (FluentIconStyle)GetValue(StyleProperty);
        set => SetValue(StyleProperty, value);
    }

    public Brush? Foreground
    {
        get => (Brush?)GetValue(ForegroundProperty);
        set => SetValue(ForegroundProperty, value);
    }

    public Stretch Stretch
    {
        get => (Stretch)GetValue(StretchProperty);
        set => SetValue(StretchProperty, value);
    }

    static void OnIconPropertyChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        ((FluentIcon)d).UpdateGeometry();
    }

    protected override Size MeasureOverride(Size availableSize)
    {
        var iconSize = GetResolvedSize();
        var width = double.IsNaN(Width) ? iconSize : Width;
        var height = double.IsNaN(Height) ? iconSize : Height;
        return new Size(width, height);
    }

    protected override void OnRender(DrawingContext drawingContext)
    {
        base.OnRender(drawingContext);

        if (RenderSize.Width <= 0 || RenderSize.Height <= 0)
            return;

        if (_isError)
        {
            var pen = new Pen(Brushes.Red, 1.5);
            var rect = new Rect(RenderSize);
            rect.Inflate(-0.75, -0.75);
            drawingContext.DrawRectangle(null, pen, rect);
            drawingContext.DrawLine(pen, rect.TopLeft, rect.BottomRight);
            drawingContext.DrawLine(pen, rect.TopRight, rect.BottomLeft);
            return;
        }

        var brush = Foreground;
        if (_geometry is null || brush is null)
            return;

        var sourceSize = _viewBox.Size;
        if (sourceSize.Width <= 0 || sourceSize.Height <= 0)
            return;

        var scale = CalculateScale(RenderSize, sourceSize, Stretch);
        var scaledSize = new Size(sourceSize.Width * scale.X, sourceSize.Height * scale.Y);
        var offsetX = (RenderSize.Width - scaledSize.Width) / 2 - _viewBox.X * scale.X;
        var offsetY = (RenderSize.Height - scaledSize.Height) / 2 - _viewBox.Y * scale.Y;

        var transform = new MatrixTransform(
            scale.X, 0,
            0, scale.Y,
            offsetX, offsetY);

        drawingContext.PushTransform(transform);
        drawingContext.DrawGeometry(brush, null, _geometry);
        drawingContext.Pop();
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
            Stretch.Fill => new Vector(scaleX, scaleY),
            Stretch.None => new Vector(1, 1),
            Stretch.UniformToFill => new Vector(Math.Max(scaleX, scaleY), Math.Max(scaleX, scaleY)),
            _ => new Vector(Math.Min(scaleX, scaleY), Math.Min(scaleX, scaleY)),
        };
    }

    static Rect ParseViewBox(string value)
    {
        var parts = value.Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        if (parts.Length != 4)
            return new Rect(0, 0, 24, 24);

        return new Rect(
            double.Parse(parts[0], CultureInfo.InvariantCulture),
            double.Parse(parts[1], CultureInfo.InvariantCulture),
            double.Parse(parts[2], CultureInfo.InvariantCulture),
            double.Parse(parts[3], CultureInfo.InvariantCulture));
    }
}
