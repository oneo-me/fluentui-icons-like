import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const marker = 'fluentui-icons-like:auto-release:v1';
const npmNames = [
  '@oneo/fluentui-icons-like',
  '@oneo/fluentui-icons-like-react',
];
const nugetNames = [
  'ONEO.FluentUIIconsLike',
  'ONEO.FluentUIIconsLike.Generator',
];
const stateFile = path.join(root, '.cache/release.json');
const repository = process.env.GITHUB_REPOSITORY;
const githubHeaders = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
};

function run(command, args, cwd = root) {
  return execFileSync(command, args, { cwd, stdio: 'inherit' });
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok)
    throw new Error(`${options.method ?? 'GET'} ${url}: ${response.status}`);
  return response;
}

async function github(endpoint, method = 'GET', body) {
  const response = await request(
    `https://api.github.com/repos/${repository}/${endpoint}`,
    {
      method,
      headers: { ...githubHeaders, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    },
  );
  return response.json();
}

export function metadata(release) {
  const match = release.body?.match(
    /<!-- fluentui-icons-like:auto-release:v1\n(.+)\n-->/,
  );
  if (!match) return null;
  const data = JSON.parse(match[1]);
  if (
    !/^\d+\.\d+\.\d+$/.test(data.version) ||
    !/^[a-f0-9]{40}$/.test(data.upstream) ||
    !/^[a-f0-9]{40}$/.test(data.assets) ||
    !/^[a-f0-9]{40}$/.test(data.source) ||
    release.tag_name !== `v${data.version}`
  ) {
    throw new Error('Invalid automatic release metadata');
  }
  return data;
}

export function releaseDue(release, now = Date.now()) {
  if (!release) return true;
  const published = Date.parse(release.published_at);
  if (!Number.isFinite(published))
    throw new Error('Invalid release publication time');
  return now - published >= 30 * 24 * 60 * 60 * 1000;
}

export function nextVersion(versions) {
  const stable = versions.filter((version) => /^\d+\.\d+\.\d+$/.test(version));
  if (!stable.length) throw new Error('No stable version found');
  stable.sort((a, b) => {
    const left = a.split('.').map(Number);
    const right = b.split('.').map(Number);
    return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
  });
  const [major, minor, patch] = stable.at(-1).split('.').map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

async function registryJson(url) {
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok)
    throw new Error(`Registry request failed: ${url}: ${response.status}`);
  return response.json();
}

function digest(file, algorithm = 'sha256') {
  return createHash(algorithm).update(fs.readFileSync(file)).digest('base64');
}

function output(name, value) {
  if (process.env.GITHUB_OUTPUT)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
  console.log(`${name}=${value}`);
}

async function entries(endpoint) {
  const result = [];
  for (let page = 1; ; page++) {
    const batch = await github(`${endpoint}?per_page=100&page=${page}`);
    result.push(...batch);
    if (batch.length < 100) return result;
  }
}

function verifyArtifacts(data) {
  const files = Object.keys(data.files ?? {});
  const expected = [
    `oneo-fluentui-icons-like-${data.version}.tgz`,
    `oneo-fluentui-icons-like-react-${data.version}.tgz`,
    ...nugetNames.map((name) => `${name}.${data.version}.nupkg`),
  ];
  if (files.length !== 4 || expected.some((name) => !files.includes(name))) {
    throw new Error('Expected all four package artifacts');
  }
  for (const name of files) {
    if (digest(path.join(root, 'publish', name)) !== data.files[name]) {
      throw new Error(`Artifact checksum mismatch: ${name}`);
    }
  }
}

export async function prepare() {
  const all = await entries('releases');
  const automatic = all.filter((release) => metadata(release));
  const pending = automatic.filter((release) => release.draft);
  if (pending.length > 1)
    throw new Error(
      'Multiple pending automatic releases; resolve them before publishing',
    );
  const completed = automatic
    .filter((release) => !release.draft)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))[0];
  if (!pending.length && !releaseDue(completed)) {
    output('prepared', 'false');
    return;
  }
  fs.mkdirSync(path.join(root, '.cache'), { recursive: true });
  const publishDir = path.join(root, 'publish');
  fs.rmSync(publishDir, { recursive: true, force: true });
  fs.mkdirSync(publishDir);
  let release = pending[0];
  if (release) {
    const data = metadata(release);
    for (const name of Object.keys(data.files ?? {})) {
      if (path.basename(name) !== name)
        throw new Error('Invalid artifact name');
      const asset = release.assets.find((item) => item.name === name);
      if (!asset)
        throw new Error(
          `Draft is missing ${name}; restore the artifact before retrying`,
        );
      const response = await request(
        `https://api.github.com/repos/${repository}/releases/assets/${asset.id}`,
        {
          headers: { ...githubHeaders, Accept: 'application/octet-stream' },
        },
      );
      fs.writeFileSync(
        path.join(publishDir, name),
        Buffer.from(await response.arrayBuffer()),
      );
    }
    verifyArtifacts(data);
  } else {
    // Release builds always start from a clean clone and clean generated directories.
    fs.rmSync(path.join(root, '.cache/source'), {
      recursive: true,
      force: true,
    });
    run('bun', ['run', 'sync']);
    const source = path.join(root, '.cache/source');
    const gitValue = (ref) =>
      execFileSync('git', ['rev-parse', ref], {
        cwd: source,
        encoding: 'utf8',
      }).trim();
    const upstream = gitValue('HEAD');
    const assets = gitValue('HEAD:assets');
    if (completed && metadata(completed).assets === assets) {
      output('prepared', 'false');
      return;
    }
    const registryVersions = [];
    for (const name of npmNames) {
      const result = await registryJson(
        `https://registry.npmjs.org/${encodeURIComponent(name)}`,
      );
      registryVersions.push(...Object.keys(result?.versions ?? {}));
    }
    for (const name of nugetNames) {
      const result = await registryJson(
        `https://api.nuget.org/v3-flatcontainer/${name.toLowerCase()}/index.json`,
      );
      registryVersions.push(...(result?.versions ?? []));
    }
    const manifestPath = path.join(root, 'package.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    const version = nextVersion([
      manifest.version,
      ...registryVersions,
      ...all.map((item) => item.tag_name.replace(/^v/, '')),
      ...(await entries('tags')).map((item) => item.name.replace(/^v/, '')),
    ]);
    fs.writeFileSync(
      manifestPath,
      manifestContent.replace(/("version"\s*:\s*")[^"]+"/, `$1${version}"`),
    );
    for (const directory of [
      'packages/svelte/src/lib/icons',
      'packages/react/src/icons',
    ]) {
      fs.rmSync(path.join(root, directory), { recursive: true, force: true });
    }
    run('bun', ['run', 'gen']);
    run('bun', ['run', 'check:ci']);
    run('bun', ['run', 'build']);
    run('dotnet', [
      'build',
      'packages/avalonia/FluentUIIconsLike.slnx',
      '-c',
      'Release',
    ]);
    run('bun', ['run', 'pack']);
    const files = Object.fromEntries(
      fs
        .readdirSync(publishDir)
        .filter((name) => /\.(tgz|nupkg)$/.test(name))
        .map((name) => [name, digest(path.join(publishDir, name))]),
    );
    const data = {
      version,
      upstream,
      assets,
      files,
      source: process.env.GITHUB_SHA,
    };
    verifyArtifacts(data);
    const body = `Automated Fluent UI icon update.\n\nUpstream: https://github.com/microsoft/fluentui-system-icons/commit/${upstream}\n\n<!-- ${marker}\n${JSON.stringify(data)}\n-->`;
    release = await github('releases', 'POST', {
      tag_name: `v${version}`,
      target_commitish: process.env.GITHUB_SHA,
      name: `v${version}`,
      body,
      draft: true,
    });
    for (const name of Object.keys(files)) {
      await request(
        `${release.upload_url.split('{')[0]}?name=${encodeURIComponent(name)}`,
        {
          method: 'POST',
          headers: {
            ...githubHeaders,
            'Content-Type': 'application/octet-stream',
          },
          body: fs.readFileSync(path.join(publishDir, name)),
        },
      );
    }
  }
  fs.writeFileSync(
    stateFile,
    JSON.stringify({ id: release.id, ...metadata(release) }),
  );
  output('prepared', 'true');
}

export async function publish() {
  if (!process.env.NPM_CONFIG_TOKEN || !process.env.NUGET_API_KEY)
    throw new Error(
      'NPM_TOKEN and NUGET_API_KEY must be configured before publishing any package',
    );
  const data = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  verifyArtifacts(data);
  for (const [index, name] of npmNames.entries()) {
    const archive = path.join(
      root,
      'publish',
      index === 0
        ? `oneo-fluentui-icons-like-${data.version}.tgz`
        : `oneo-fluentui-icons-like-react-${data.version}.tgz`,
    );
    const existing = await registryJson(
      `https://registry.npmjs.org/${encodeURIComponent(name)}/${data.version}`,
    );
    if (existing) {
      if (existing.dist?.integrity !== `sha512-${digest(archive, 'sha512')}`) {
        throw new Error(
          `Published npm package differs from the draft: ${name}`,
        );
      }
    } else {
      run('bun', ['publish', archive, '--access', 'public']);
    }
  }
  for (const name of nugetNames) {
    // The API key stays out of child-process arguments and logs.
    const archive = path.join(root, 'publish', `${name}.${data.version}.nupkg`);
    const versions = await registryJson(
      `https://api.nuget.org/v3-flatcontainer/${name.toLowerCase()}/index.json`,
    );
    if (versions?.versions.includes(data.version)) continue;
    const response = await fetch('https://www.nuget.org/api/v2/package', {
      method: 'PUT',
      headers: { 'X-NuGet-ApiKey': process.env.NUGET_API_KEY },
      body: (() => {
        const form = new FormData();
        form.append(
          'package',
          new Blob([fs.readFileSync(archive)]),
          path.basename(archive),
        );
        return form;
      })(),
    });
    if (!response.ok)
      throw new Error(`NuGet publish failed for ${name}: ${response.status}`);
  }
  await github(`releases/${data.id}`, 'PATCH', { draft: false });
  console.log(`Published v${data.version}`);
}

if (import.meta.main) {
  if (!repository || !process.env.GITHUB_TOKEN)
    throw new Error('Run this script in GitHub Actions');
  if (process.argv[2] === 'prepare') await prepare();
  else if (process.argv[2] === 'publish') await publish();
  else throw new Error('Usage: node scripts/release.mjs <prepare|publish>');
}
