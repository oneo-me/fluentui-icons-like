# Changelog

User-facing release notes for the supported Svelte, React, and Avalonia packages. Experimental WPF is not part of this release stream.

Automatic GitHub Releases use independently generated upstream and recovery metadata; the release script does not consume this file. The root package version is a local packing baseline, so published history is not inferred from it.

## [Unreleased]

- Redesign the preview catalog with Light & Shadow surfaces, pure-white/logo-inspired blue and navy/blue themes, softer rounded controls, a compact icon grid, live result counts inside the search field, a total count in the lower-left footer, and an unheaded detail panel. A compact search field sits on the right of the header without a catalog introduction or scaling controls; the improved color picker beside downloads affects only PNG output, leaving previews and SVG exports unchanged. Search keywords and PNG colors persist locally instead of appearing in shared URLs. Columns use an open layout with thin dividers instead of outer card containers; the header brings together the logo, title, and Getting started link, and a global persisted framework selector controls React, Svelte, Avalonia, and explicitly experimental WPF source examples.
