# Preview Catalog

## Entry point and data

`apps/preview` is a React SPA with a single `/` route. It supports discovery, preview, browser-side export, and React/Svelte/Avalonia integration snippets and experimental WPF source-integration examples.

[The registry](../../apps/preview/src/preview/registry.ts) fetches generated `icons.json` on first use and caches the loading promise. Each entry has a key, name, available sizes/styles, keywords, description, metaphor, and direction metadata. Vite `import.meta.glob` binds entries to React source-module loaders. A missing matching module throws; unsuccessful metadata fetches also throw.

[LazyIcon](../../apps/preview/src/preview/LazyIcon.tsx) loads a module when rendered and uses a same-size placeholder while loading. [Vite configuration](../../apps/preview/vite.config.ts) groups generated modules by filename prefix to avoid one all-icons main bundle.

## Search and state ownership

[PreviewApp](../../apps/preview/src/preview/PreviewApp.tsx) coordinates filters and selection.

- Size/style options use the union of available metadata values; defaults are 20 and `Regular`.
- Metaphor options come from icons available at the current size/style, with their own keyword filter.
- Main search covers key, name, keywords, description, styles, sizes, and metaphor.
- Search splits on whitespace; every term must occur in the icon's combined search text.
- Size, style, and metaphor filters apply before text search.
- If the current selection leaves the result set, the first result is selected. An empty set has a visible empty state.

Search, size, style, metaphor, selected icon, and PNG export color (the existing `color` parameter) are synchronized to URL query parameters. [Query validation](../../apps/preview/src/preview/search.ts) accepts positive sizes and six-digit hex colors. Defaults are omitted when serializing. Legacy `scale` parameters are ignored; display scaling is not supported.

The global framework selector in the page header is owned by PreviewApp and passed to IconDetails. It offers React, Svelte, Avalonia, and experimental WPF. The choice is stored separately in localStorage using the existing `fluentui-icons-like:active-package-tab` key; it is a browser preference, not shareable query state. Invalid values or unavailable storage fall back to React without preventing selection.

## Catalog and exports

[IconCatalog](../../apps/preview/src/preview/IconCatalog.tsx) measures its viewport, derives tile size and column count from asset size, and virtualizes rows with TanStack Virtual. Filter changes reset scroll position. Icons render at the selected asset size without a display multiplier.

Catalog tiles and the detail preview always use the theme foreground. The color picker beside the download controls applies only to PNG rasterization, defaults to black, and exposes a swatch, hex value, and reset action. It does not recolor the interface, preview, SVG download, copied SVG, or integration snippets. Details show descriptive metadata, supported styles, and sizes.

[IconDetails](../../apps/preview/src/preview/IconDetails.tsx) clones and serializes the rendered SVG for download or clipboard copying, setting selected dimensions and resolving the current theme color through computed style. Only the PNG path overrides the clone's color with the PNG export color before rasterizing that SVG through a browser canvas at `max(256, asset size * 8)`, with a transparent background.

The global framework choice controls installation and usage snippets for React, Svelte, and Avalonia from the current selection and root version. WPF shows a source link, an experimental/build-limitations warning, and XAML namespace, explicit-reference, and usage examples; it does not suggest registry installation or claim publication. WPF remains excluded from supported release targets. Properties matching framework defaults are omitted. The root version is a local baseline, not a live registry lookup. Clipboard and download behavior depends on browser APIs.

## Visual and responsive conventions

The catalog is a tool workspace, not a marketing page. Its Light & Shadow visual language adapts Design Styles' semantic palette, rounded surfaces, contact shadows, button gradients, and input focus treatment to the existing Radix primitives; it does not depend on that application's Base UI components or style-switching runtime. Icons remain the main content, with a header search field and an unheaded detail panel that starts directly with the icon preview. The search field contains the live matching-result count, including while text is entered; the total registry count appears only in the lower-left filter footer above the attribution. The catalog has no introductory heading or toolbar.

- Semantic tokens follow the system color preference. Light mode uses warm white (`#FCFBF9`), near-white cards, deep orange actions (`#BD481B`), and orange focus/links. Dark mode uses deep navy (`#090E18`) and pale blue actions. PNG export color does not affect these interface or preview colors.
- System sans and monospace stacks keep interface and snippets native. Most interface text is 11–13px; section titles provide a larger visual hierarchy.
- Wide layout is `220px / flexible catalog / 280px` for filters, catalog, and details, with an open, unboxed layout and thin vertical dividers between adjacent columns. The global header places the logo and product title on the left, a compact 300px search field aligned to the right; the framework selector and Getting started link sit on the right, with Getting started last. Below 900px search moves to a full-width row; below 600px branding and actions also stack. The framework selector remains available at every viewport width. The shell uses dynamic viewport height; rounding and shadows remain on controls, tiles, and the icon preview rather than column wrappers.
- At the 980px breakpoint, details are hidden and filters narrow to 210px.
- At 760px, filters move above the catalog with a maximum height of 36vh and a horizontal divider instead of a vertical one.
- Grid columns depend on available width and selected asset size rather than a fixed count. Tiles have a minimum 56px size, 6px gaps, and 12px grid padding. Filters use 12px padding and section gaps; the header uses 8px vertical padding and 40px-high controls. Panels own local scrolling.
- Hover uses subtle surface/border/shadow feedback; selected tiles add an outline. Copy actions have short feedback; loading and no results have textual states.
- Common transitions are about 150ms ease-out. A shared reduced-motion base rule minimizes transitions and animations; copy/loading animations also use motion-safe utilities.
- Primary buttons use a subtle gradient and inset highlight; inputs and outline buttons use card surfaces with strengthened boundaries. Tile and filter selection expose `aria-pressed`, and tiles have accessible icon names.

The current narrow layout hides all detail controls, including export and integration snippets. Browsing remains available, but those tasks have no narrow-screen replacement.

Shared styles belong in [styles.css](../../apps/preview/src/styles.css); component layout, responsive behavior, and state styles belong in Tailwind classes. UI primitives live in `src/components/ui`, configured by `components.json`.

## Verification

Use `bun run check:ci` and `bun run build` for static validation. Manual acceptance should cover shareable URLs, invalid query values, long metadata, large asset sizes, live search-field counts, a stable footer total, ignored legacy `scale` parameters, empty results, lazy loading, clipboard permissions, SVG/PNG transparency, PNG-only color isolation (including legacy `color` URLs, reset, and theme changes), and persisted framework selection, all four framework examples, invalid/unavailable localStorage, and the experimental WPF warning.

Check wide, 980px, and 760px layouts in both themes. Controls need accessible labels and visible keyboard focus; selection, loading, copying, and disabled states must not rely on color alone. Verify reduced-motion behavior and text/border contrast manually rather than inferring accessibility acceptance from a successful build.
