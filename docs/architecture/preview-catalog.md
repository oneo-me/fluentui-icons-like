# Preview Catalog

## Entry point and data

`apps/preview` is a React SPA with a single `/` route. It supports discovery, preview, browser-side export, and React/Svelte/Avalonia integration snippets.

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

Search, size, style, metaphor, selected icon, color, and scale are synchronized to URL query parameters. [Query validation](../../apps/preview/src/preview/search.ts) accepts positive sizes, six-digit hex colors, and scales 1/2/3. Defaults are omitted when serializing.

The selected package tab is stored separately in localStorage; it is a browser preference, not shareable query state.

## Catalog and exports

[IconCatalog](../../apps/preview/src/preview/IconCatalog.tsx) measures its viewport, derives tile size and column count from asset size and display scale, and virtualizes rows with TanStack Virtual. Filter/scale changes reset scroll position.

Chosen color affects tiles, the detail preview, and exports. Without a custom color, icons use the theme foreground. Details show descriptive metadata, supported styles, and sizes.

[IconDetails](../../apps/preview/src/preview/IconDetails.tsx) clones and serializes the rendered SVG for download or clipboard copying, setting selected dimensions and color. PNG export rasterizes that SVG through a browser canvas at `max(256, asset size * 8)`, with a transparent background.

React, Svelte, and Avalonia tabs produce installation and usage snippets from the current selection and root version. Properties matching framework defaults are omitted. The root version is a local baseline, not a live registry lookup. Clipboard and download behavior depends on browser APIs.

## Visual and responsive conventions

The catalog is a compact tool workspace, not a marketing page. Icons are the main content; restrained surfaces, borders, and blue accents organize controls.

- Light/dark OKLCH tokens follow the system color preference. Blue marks primary actions, selection, focus, and links; custom icon color does not change interface semantics.
- Inter Variable uses system sans fallbacks; snippets use a system monospace stack. Most interface text is 11–13px.
- Wide layout is `236px / flexible catalog / 282px` for filters, catalog, and details.
- At the 980px breakpoint, details are hidden and filters narrow to 210px.
- At 760px, filters move above the catalog with a maximum height of 42vh; the toolbar becomes two rows.
- Grid columns depend on available width and display size rather than a fixed count. Panels own local scrolling.
- Hover uses subtle surface/border/shadow feedback; selected tiles add an outline. Copy actions have short feedback; loading and no results have textual states.
- Common transitions are about 150ms ease-out. Copy/loading animations use reduced-motion-aware handling.

The current narrow layout hides all detail controls, including export and integration snippets. Browsing remains available, but those tasks have no narrow-screen replacement.

Shared styles belong in [styles.css](../../apps/preview/src/styles.css); component layout, responsive behavior, and state styles belong in Tailwind classes. UI primitives live in `src/components/ui`, configured by `components.json`.

## Verification

Use `bun run check:ci` and `bun run build` for static validation. Manual acceptance should cover shareable URLs, invalid query values, long metadata, large display scales, empty results, lazy loading, clipboard permissions, SVG/PNG transparency, and persisted tab selection.

Check wide, 980px, and 760px layouts in both themes. Controls need accessible labels and visible keyboard focus; selection, loading, copying, and disabled states must not rely on color alone. Verify reduced-motion behavior and text/border contrast manually rather than inferring accessibility acceptance from a successful build.
