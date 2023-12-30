using Avalonia.Controls;

namespace Avalonia.FluentUI.Icons;

public class FluentIcon : PathIcon
{
    protected override Type StyleKeyOverride { get; } = typeof(PathIcon);
}
