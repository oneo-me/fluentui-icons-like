# Architecture

## Purpose and scope

FluentUI Icons Like converts [Microsoft Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) into framework-native components and provides a browser catalog for discovery, inspection, and export.

The supported targets are Svelte, React, and Avalonia. Each uses its ecosystem's native API rather than a cross-framework runtime abstraction. WPF source is present but experimental, with known build limitations and no automatic publication.

The project does not redesign upstream icons, provide an icon editor, or host user icon collections. The preview has no accounts, synchronization, or server-side search. Published packages do not depend on the preview site.

## Components and boundaries

| Component                     | Responsibility                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| Upstream repository           | Owns icon names, metadata, sizes, styles, and SVG geometry.                                             |
| Bun builder                   | Synchronizes assets, scans a shared model, generates target files, and packs supported packages.        |
| Svelte package                | Delivers independently imported Svelte 5 components.                                                    |
| React package                 | Delivers independently imported SVG components and a shared rendering helper.                           |
| Avalonia runtime and analyzer | Render geometry and generate application-specific data from explicit symbol references.                 |
| React preview                 | Consumes generated metadata and React source modules for browsing and browser-side export.              |
| Release automation            | Selects versions, saves immutable draft archives, publishes to npm/NuGet, and resumes partial releases. |

External boundaries are the upstream Git repository, npm and NuGet registries, GitHub Actions/Releases, consuming application builds, and Cloudflare hosting.

## Core models and flows

An `IconDefinition` contains a normalized key, upstream name, available sizes and styles, descriptive metadata, direction information, and sources. Each source contains a size/style pair, viewBox, and recursive SVG nodes. The scan records variants actually found, not every variant claimed by metadata.

```text
Upstream assets in .cache/source
  -> shared scan model
  -> Svelte components
  -> React components + preview metadata
  -> Avalonia enums + analyzer-embedded path data
  -> WPF enums + analyzer-embedded path data (explicit target only)

React source modules + preview metadata
  -> static browser catalog
  -> SVG / PNG export and integration snippets

Supported packages
  -> local archives in publish/
  -> GitHub Release draft
  -> npm / NuGet
  -> public GitHub Release after all packages are accepted
```

Generation owns derived files; downstream packages do not modify upstream definitions. Web components select a fallback source when a requested combination is absent. Avalonia and WPF require an exact variant from explicitly referenced data.

Preview query state belongs to the URL; the selected integration tab belongs to browser localStorage. Neither changes package contents. Automated release recovery state belongs to a GitHub Release draft and its original archives.

## Repository layout

```text
.
├── AGENTS.md                 # Local contributor rules
├── ARCHITECTURE.md           # System map and subject index
├── CHANGELOG.md              # User-facing release notes
├── README.md                 # Package usage and quick start
├── docs/
│   ├── README.md             # Documentation navigation
│   ├── assets/               # Documentation image resource
│   └── architecture/         # Mechanism definitions
├── apps/
│   ├── builder/              # Bun synchronization, generation, and packing
│   └── preview/              # React + TanStack Router catalog
├── packages/
│   ├── svelte/
│   ├── react/
│   ├── avalonia/             # Runtime, analyzer, and demo
│   └── wpf/                  # Experimental runtime, analyzer, and demo
├── scripts/                  # Automatic release implementation and tests
├── .github/workflows/        # Scheduled/default-branch publication
├── .cache/source/            # Ignored upstream checkout
├── publish/                  # Ignored local package archives
├── bun.lock                  # Shared workspace lockfile
├── package.json              # Root commands and local version baseline
└── wrangler.jsonc            # Static SPA deployment configuration
```

## Verification boundaries

Source presence establishes implementation, not end-to-end acceptance. Workspace checks cover TypeScript and Web tooling; .NET builds are separate. Mock release tests do not establish live npm/NuGet publication, GitHub-hosted execution, or Cloudflare deployment. WPF additionally requires Windows runtime verification.

No historical version sections are inferred from the root package version: it is a local packing baseline, not proof of publication.

## Subjects

| Document                                                  | When to read it                                                                                                 |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| [Build pipeline](docs/architecture/build-pipeline.md)     | Changing upstream synchronization, scanning, generation, dependencies, local packing, or verification commands. |
| [Svelte package](docs/architecture/svelte-package.md)     | Changing Svelte component properties, source selection, or distribution.                                        |
| [React package](docs/architecture/react-package.md)       | Changing React SVG rendering, refs, source selection, exports, or preview metadata generation.                  |
| [Avalonia package](docs/architecture/avalonia-package.md) | Changing explicit symbol references, analyzer diagnostics, provider registration, or geometry rendering.        |
| [Preview catalog](docs/architecture/preview-catalog.md)   | Changing search, URL state, virtualization, export, responsive layout, or interface conventions.                |
| [Upstream release](docs/architecture/upstream-release.md) | Changing eligibility, version selection, credentials, draft recovery, or publication.                           |
| [WPF package](docs/architecture/wpf-package.md)           | Working on the experimental Windows runtime, analyzer, demo, or platform validation.                            |
