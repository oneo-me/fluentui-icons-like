# Svelte Package

## Distribution

`@oneo/fluentui-icons-like` provides one `FluentIcon<Name>.svelte` file per icon. Consumers import component subpaths directly; there is no required all-icons registry. Package exports expose `./*.svelte`, and `sideEffects: false` supports tree shaking.

Components use Svelte 5 runes. Svelte `^5.0.0` is a peer dependency; the package has no runtime dependencies.

## Component contract

- `size` accepts known asset sizes or any number; its default is the preferred generated size.
- `style` accepts known styles or any string; the default prefers `Regular`.
- `title` defaults to the upstream name. Null or an empty string omits the SVG title.
- Other standard SVG properties pass through to the root element. `style` and `title` have component-specific meanings rather than native SVG attribute semantics.
- Generated root CSS uses `currentColor` for fill and stroke, inheriting surrounding text color.

Source selection tries requested size/style, default size/requested style, requested size/default style, then default size/default style. Display dimensions use the requested `size`; caller-supplied SVG attributes can override root styling. Without a source, no SVG renders.

## Generation and checks

[The generator](../../apps/builder/src/generators/svelte.ts) emits SVG nodes directly into component templates, with size/style mappings to source keys and viewBoxes. `svelte-package` builds `src/lib/icons` into `dist`, including declarations.

Use `bun run gen -- svelte` after generator changes and `bun run check:ci` for workspace validation. Check title suppression, inherited color, known variants, and fallback selection in a consuming Svelte application. Usage examples are in the [README](../../README.md#svelte).
