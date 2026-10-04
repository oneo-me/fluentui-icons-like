# React Package

## Distribution

`@oneo/fluentui-icons-like-react` provides a default-exported `FluentIcon<Name>` component at each component subpath. Each module carries only that icon's variants and SVG nodes. There is no required central registry. Output is ESM with `sideEffects: false`; the declared React peer range is `>=16.8.0`.

## Component contract

[The shared runtime](../../packages/react/src/createFluentIcon.ts) uses `forwardRef` to expose the root `SVGSVGElement`.

- `size` accepts known asset sizes or any number, defaulting to the generated preferred size.
- `variant` accepts known styles or any string, defaulting to `Regular` when available.
- `title` defaults to the upstream name; null or an empty string omits the title element.
- Other `React.SVGAttributes<SVGSVGElement>` pass through to the root SVG.

Source selection tries requested size/variant, default size/requested variant, requested size/default variant, then default size/default variant. Root width/height initially use `size`; explicit SVG attributes can override them. Without a source, the component returns null.

SVG nodes are recursively created with React, not injected as raw HTML. The generator converts SVG attribute names to React camelCase while preserving `aria-*` and `data-*`.

## Preview relationship and checks

[The generator](../../apps/builder/src/generators/react.ts) writes `packages/react/src/icons` and naturally sorted preview metadata. The preview imports these source components through Vite glob loaders, so it uses the same rendering implementation. The published npm package does not depend on the preview.

Use `bun run gen -- react`, `bun run check:ci`, and `bun run build` for generation, workspace checks, and preview integration. Verify refs, title suppression, SVG attribute overrides, and fallback behavior in a consumer when changing the API. See [README usage](../../README.md#react).
