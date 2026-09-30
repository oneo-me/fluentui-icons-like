import { test } from 'bun:test';
import assert from 'node:assert/strict';
import { metadata, nextVersion, releaseDue } from './release.mjs';

test('30 day gate handles boundaries and rejects invalid publication time', () => {
  const start = Date.parse('2026-01-01T00:00:00Z');
  const release = { published_at: new Date(start).toISOString() };
  assert.equal(releaseDue(null, start), true);
  assert.equal(releaseDue(release, start + 30 * 86400000 - 1), false);
  assert.equal(releaseDue(release, start + 30 * 86400000), true);
  assert.throws(() => releaseDue({ published_at: 'invalid' }));
});

test('version exceeds the root, registry and existing release versions', () => {
  assert.equal(
    nextVersion(['2.1.1', '2.1.9', '2.1.10', '2.2.0-preview.1']),
    '2.1.11',
  );
  assert.equal(nextVersion(['2.1.1', '3.0.0']), '3.0.1');
  assert.throws(() => nextVersion(['invalid']));
});

test('release metadata distinguishes automatic releases and validates tag identity', () => {
  assert.equal(metadata({ body: 'Manual release' }), null);
  const data = {
    version: '2.1.2',
    upstream: 'a'.repeat(40),
    assets: 'b'.repeat(40),
    source: 'c'.repeat(40),
  };
  const release = {
    tag_name: 'v2.1.2',
    body: `<!-- fluentui-icons-like:auto-release:v1\n${JSON.stringify(data)}\n-->`,
  };
  assert.deepEqual(metadata(release), data);
  assert.throws(() => metadata({ ...release, tag_name: 'v2.1.3' }));
});

async function recoveryScenario(mode) {
  const { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } =
    await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const directory = mkdtempSync(join(tmpdir(), 'fluentui-release-test-'));
  mkdirSync(join(directory, 'scripts'));
  copyFileSync(
    new URL('./release.mjs', import.meta.url),
    join(directory, 'scripts/release.mjs'),
  );
  writeFileSync(
    join(directory, 'scenario.mjs'),
    `
    import assert from 'node:assert/strict';
    import { createHash } from 'node:crypto';
    import fs from 'node:fs';
    process.env.GITHUB_REPOSITORY = 'test/icons';
    process.env.GITHUB_TOKEN = 'test-token';
    process.env.GITHUB_OUTPUT = new URL('./output', import.meta.url).pathname;
    process.env.NUGET_API_KEY = 'test-key';
    process.env.NPM_CONFIG_TOKEN = 'test-npm-token';
    const mode = ${JSON.stringify(mode)};
    const version = '2.1.2';
    const names = [
      'oneo-fluentui-icons-like-2.1.2.tgz',
      'oneo-fluentui-icons-like-react-2.1.2.tgz',
      'ONEO.FluentUIIconsLike.2.1.2.nupkg',
      'ONEO.FluentUIIconsLike.Generator.2.1.2.nupkg',
    ];
    const bytes = Buffer.from('saved immutable archive');
    const checksum = createHash('sha256').update(bytes).digest('base64');
    const integrity = 'sha512-' + createHash('sha512').update(bytes).digest('base64');
    const data = { version, upstream: 'a'.repeat(40), assets: 'b'.repeat(40), source: 'c'.repeat(40),
      files: Object.fromEntries(names.map(name => [name, checksum])) };
    const draft = { id: 1, tag_name: 'v2.1.2', draft: true,
      body: '<!-- fluentui-icons-like:auto-release:v1\\n' + JSON.stringify(data) + '\\n-->',
      assets: names.map((name, id) => ({ name, id })) };
    let completed = false;
    let nugetUploads = 0;
    if (mode === 'fresh') {
      fs.mkdirSync(new URL('./bin', import.meta.url));
      const publisher = new URL('./bin/bun', import.meta.url);
      fs.writeFileSync(publisher, '#!/bin/sh\\n[ "$NPM_CONFIG_TOKEN" = "test-npm-token" ] || exit 1\\nprintf published >> npm-published\\n');
      fs.chmodSync(publisher, 0o755);
      process.env.PATH = new URL('./bin', import.meta.url).pathname + ':' + process.env.PATH;
    }
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status });
    globalThis.fetch = async (url, options = {}) => {
      if (url.includes('releases?')) {
        if (mode === 'interval') return json([{ ...draft, draft: false, published_at: new Date().toISOString() }]);
        return json([draft]);
      }
      if (url.includes('releases/assets/')) return new Response(mode === 'damaged' ? 'damaged' : bytes);
      if (url.includes('registry.npmjs.org')) {
        if (mode === 'fresh') return json({}, 404);
        if (mode === 'registry-error') return json({}, 503);
        return json({ dist: { integrity: mode === 'conflict' ? 'wrong' : integrity } });
      }
      if (url.includes('nuget.org/v3-flatcontainer')) return json({ versions: mode === 'fresh' ? [] : [version] });
      if (url === 'https://www.nuget.org/api/v2/package' && options.method === 'PUT') {
        assert.equal(options.headers['X-NuGet-ApiKey'], 'test-key');
        assert.deepEqual(Buffer.from(await options.body.get('package').arrayBuffer()), bytes);
        nugetUploads++;
        return json({}, 201);
      }
      if (url.endsWith('releases/1') && options.method === 'PATCH') {
        assert.equal(JSON.parse(options.body).draft, false);
        completed = true;
        return json({});
      }
      throw new Error('Unexpected network request: ' + url);
    };
    const { prepare, publish } = await import('./scripts/release.mjs');
    if (mode === 'interval') {
      await prepare();
      assert.equal(fs.readFileSync(process.env.GITHUB_OUTPUT, 'utf8'), 'prepared=false\\n');
      assert.equal(fs.existsSync(new URL('./publish', import.meta.url)), false);
    } else if (mode === 'damaged') {
      await assert.rejects(prepare(), /checksum mismatch/);
    } else {
      await prepare();
      assert.equal(fs.readFileSync(process.env.GITHUB_OUTPUT, 'utf8'), 'prepared=true\\n');
      for (const name of names) assert.deepEqual(fs.readFileSync(new URL('./publish/' + name, import.meta.url)), bytes);
      if (mode === 'conflict') await assert.rejects(publish(), /differs from the draft/);
      else if (mode === 'registry-error') await assert.rejects(publish(), /Registry request failed/);
      else if (mode === 'missing-token') {
        delete process.env.NPM_CONFIG_TOKEN;
        await assert.rejects(publish(), /NPM_TOKEN and NUGET_API_KEY/);
      }
      else await publish();
      assert.equal(completed, mode === 'resume' || mode === 'fresh');
      if (mode === 'fresh') {
        assert.equal(nugetUploads, 2);
        assert.equal(fs.readFileSync(new URL('./npm-published', import.meta.url), 'utf8'), 'publishedpublished');
      }
    }
  `,
  );
  try {
    const result = spawnSync(
      process.execPath,
      [join(directory, 'scenario.mjs')],
      {
        cwd: directory,
        encoding: 'utf8',
        timeout: 30000,
      },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const [mode, description] of [
  [
    'resume',
    'resumes saved archives and completes a partially published release',
  ],
  ['interval', 'recent release skips build and publication'],
  ['damaged', 'damaged draft archive prevents publication'],
  ['conflict', 'conflicting npm integrity prevents release completion'],
  ['registry-error', 'registry errors cannot be mistaken for missing versions'],
  ['missing-token', 'missing npm token prevents publication of any package'],
  [
    'fresh',
    'publishes all four saved archives and passes the token to Bun publishing',
  ],
]) {
  test(description, () => recoveryScenario(mode));
}
