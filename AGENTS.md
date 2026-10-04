# Contributor Instructions

## Purpose and constraints

FluentUI Icons Like generates framework-native components from Microsoft Fluent UI System Icons. Svelte, React, and Avalonia are the supported release targets; WPF is experimental and excluded from default generation, packing, and automatic publication.

- Read [ARCHITECTURE.md](ARCHITECTURE.md) in full before coding, then read the relevant subject documents.
- Write repository documentation in English. Preserve package names, component names, and upstream metadata.
- Use Bun and the shared root `bun.lock`. Install dependencies at the repository root, not in individual workspaces.
- Treat upstream SVG and metadata as the icon source of truth. Change generators or shared runtimes rather than hand-editing generated icons, enums, embedded data, or preview metadata.
- Keep preview component layout and responsive styles in Tailwind classes. Reserve `apps/preview/src/styles.css` for imports, tokens, base rules, and shared keyframes.
- Do not add WPF to supported release targets without updating generation, packing, verification, and release contracts together.

## Documentation and branches

- Update the owning subject alongside mechanism changes. Update the overview, subject index, and README usage instructions when affected.
- Maintain applicable `Unreleased` entries in [CHANGELOG.md](CHANGELOG.md) for completed user-visible changes. Do not list routine documentation edits or unfinished capabilities as release promises.
- Keep documentation on the same branch as its implementation. Reconcile definitions, references, and verification claims with the code during merges.
- No repository-owned documentation checker exists. Review relative links, subject coverage, and documentation accuracy when editing Markdown.

## Verification and releases

- `bun run check:ci` validates lint, formatting, and workspace types without writing files; `bun run check` applies fixes and formatting.
- `bun run test` tests release automation against mocked services. It does not verify live registry publication.
- Use the relevant build and platform checks from the subject documents. Do not claim Windows behavior from a cross-targeted build.
- `bun run pack` clears packing outputs and synchronizes package versions. It is not a read-only check.
- Before a requested release, review shipping scope, move applicable `Unreleased` notes into the confirmed version, and retain `Unreleased` for deferred changes or an empty next cycle.
- Automatic release bodies contain recovery metadata owned by `scripts/release.mjs`; preserve it. GitHub Release creation is not authorization for unrelated version bumps or publishing.
