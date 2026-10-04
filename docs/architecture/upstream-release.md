# Automatic Upstream Release

## Trigger and eligibility

[The workflow](../../.github/workflows/upstream-release.yml) runs daily at 03:23 UTC or through manual dispatch, on the default branch only. Concurrency prevents overlapping runs.

[The release script](../../scripts/release.mjs) permits a new release when at least 30 days have passed since the last successful automatic release and the upstream `assets` Git tree has changed. The first run is immediately eligible. Manual runs use the same rules. An unfinished draft takes priority and resumes without waiting for the interval.

GitHub schedules can be delayed; public repositories can have schedules disabled after 60 days without activity. This is not an exact-time or permanently guaranteed timer.

## Preparation and versioning

Preparation uses a clean upstream clone and clears generated Web icon directories. It generates supported targets from the same upstream commit, validates workspace types/formatting, builds the preview and Avalonia solution, and packs four archives.

The shared version is the next patch above the maximum of the root version, stable registry versions for all four packages, and existing GitHub tag/Release versions. Version changes occur in the build workspace, not as commits back to the default branch. The root version remains the local packing baseline.

WPF is excluded. Preview compilation is a validation step; Cloudflare deployment is independent.

## Immutable drafts and recovery

Before registry publication, all four archives and checksums are saved in a GitHub Release draft. Its body records version, upstream commit, assets tree, and recovery metadata. The GitHub tag identifies the generator source commit; the body identifies the upstream commit.

Retries download those exact archives rather than rebuilding or selecting another version. Existing npm versions must match saved archive integrity. Missing or damaged draft assets stop publication and require restoration of the original assets.

npm and NuGet publication is sequential, not atomic. Some packages may be available before others. The Release becomes public only after all four packages are accepted.

Do not edit or remove the machine-readable recovery marker while maintaining release prose. `CHANGELOG.md` is contributor-maintained user-facing history; this script does not parse it.

## Credentials and operation

Configure repository Actions secrets:

1. `NPM_TOKEN`: publish access to both npm packages and non-interactive publishing permission. It is passed to Bun as `NPM_CONFIG_TOKEN`.
2. `NUGET_API_KEY`: publication rights for both Avalonia package IDs.
3. The workflow's `GITHUB_TOKEN` needs `contents: write` to create releases and upload archives.

Renew registry credentials before expiry. Enable Actions and keep the workflow on the default branch.

When recording a release in [CHANGELOG.md](../../CHANGELOG.md), review the shipping scope, move applicable `Unreleased` entries into the confirmed version, and retain `Unreleased` for deferred changes or an empty next cycle. Do not infer publication from local archive creation or a draft.

## Verification boundaries

`bun run test` executes [mocked release tests](../../scripts/release.test.mjs), covering interval boundaries, shared version selection, metadata validation, draft recovery, damaged artifacts, npm conflicts, registry failures, missing credentials, and simulated publication.

For local validation:

```bash
bun install --frozen-lockfile
bun run check:ci
bun run test
bun run build
```

These commands do not publish. They do not establish hosted Actions execution, live registry acceptance, or token validity. Verify those separately during an authorized release.
