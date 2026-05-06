import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT_DIR } from './constants.js';

const PUBLISH_DIR = path.resolve(ROOT_DIR, 'publish');
const SVELTE_DIR = path.resolve(ROOT_DIR, 'packages', 'svelte');
const AVALONIA_DIR = path.resolve(ROOT_DIR, 'packages', 'avalonia');
const AVALONIA_VERSION_PROPS = path.resolve(AVALONIA_DIR, 'Directory.Build.props');
const SVELTE_BUILD_DIRS = [
  path.resolve(SVELTE_DIR, 'dist'),
  path.resolve(SVELTE_DIR, '.svelte-kit'),
];

const npmPackage = {
  name: '@oneo/fluentui-icons-like',
  directory: SVELTE_DIR,
  manifestPath: path.resolve(SVELTE_DIR, 'package.json'),
  readmePath: path.resolve(SVELTE_DIR, 'README.md'),
};

const nugetPackages = [
  {
    name: 'ONEO.FluentUIIconsLike',
    packageId: 'ONEO.FluentUIIconsLike',
    projectPath: path.resolve(
      AVALONIA_DIR,
      'FluentUIIconsLike',
      'FluentUIIconsLike.csproj',
    ),
  },
  {
    name: 'ONEO.FluentUIIconsLike.Generator',
    packageId: 'ONEO.FluentUIIconsLike.Generator',
    projectPath: path.resolve(
      AVALONIA_DIR,
      'FluentUIIconsLike.Generator',
      'FluentUIIconsLike.Generator.csproj',
    ),
  },
];

export function pack(version: string): void {
  console.log(`Packing all packages with version ${version}...`);

  cleanPackArtifacts();
  fs.mkdirSync(PUBLISH_DIR, { recursive: true });

  setNpmPackageVersion(version);
  setNugetPackageVersions(version);

  const npmArchive = packNpmPackage(version);
  copyArtifactToPublishDir(npmArchive);
  fs.rmSync(npmArchive, { force: true });

  for (const nugetPackage of nugetPackages) {
    const artifact = packNugetPackage(nugetPackage.projectPath, nugetPackage.packageId);
    copyArtifactToPublishDir(artifact);
  }

  console.log(`Artifacts written to ${path.relative(ROOT_DIR, PUBLISH_DIR)}`);
}

function cleanPackArtifacts(): void {
  resetDirectory(PUBLISH_DIR);
  console.log(`  Cleared ${path.relative(ROOT_DIR, PUBLISH_DIR)}`);

  for (const directoryPath of SVELTE_BUILD_DIRS) {
    removeDirectoryIfExists(directoryPath);
    console.log(`  Cleared ${path.relative(ROOT_DIR, directoryPath)}`);
  }

  for (const nugetPackage of nugetPackages) {
    const projectDir = path.dirname(nugetPackage.projectPath);
    for (const buildDirectoryName of ['bin', 'obj']) {
      const buildDirectoryPath = path.resolve(projectDir, buildDirectoryName);
      removeDirectoryIfExists(buildDirectoryPath);
      console.log(`  Cleared ${path.relative(ROOT_DIR, buildDirectoryPath)}`);
    }
  }
}

function setNpmPackageVersion(version: string): void {
  const manifest = JSON.parse(
    fs.readFileSync(npmPackage.manifestPath, 'utf8'),
  ) as Record<string, unknown>;
  manifest.version = version;
  fs.writeFileSync(
    npmPackage.manifestPath,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(`  Set ${npmPackage.name} version to ${version}`);
}

function setNugetPackageVersions(version: string): void {
  updateXmlVersionTag(AVALONIA_VERSION_PROPS, version);
  console.log(`  Set Avalonia package version to ${version}`);
}

function packNpmPackage(version: string): string {
  console.log(`  Packing ${npmPackage.name}...`);
  fs.copyFileSync(path.resolve(ROOT_DIR, 'README.md'), npmPackage.readmePath);
  try {
    const output = execFileSync('pnpm', ['pack'], {
      cwd: npmPackage.directory,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    }).trim();
    const archiveName = output.split(/\r?\n/).at(-1);
    if (!archiveName) {
      throw new Error(`Unable to determine packed archive for ${npmPackage.name}`);
    }

    const archivePath = path.resolve(npmPackage.directory, archiveName);
    if (!fs.existsSync(archivePath)) {
      throw new Error(`Packed archive not found: ${archivePath}`);
    }

    console.log(`  Packed ${npmPackage.name} ${version}`);
    return archivePath;
  } finally {
    fs.rmSync(npmPackage.readmePath, { force: true });
  }
}

function packNugetPackage(projectPath: string, packageId: string): string {
  console.log(`  Packing ${path.basename(projectPath, '.csproj')}...`);
  execFileSync(
    'dotnet',
    ['pack', projectPath, '-c', 'Release', '-o', PUBLISH_DIR],
    {
      cwd: AVALONIA_DIR,
      stdio: 'inherit',
    },
  );

  const artifactPath = path.resolve(
    PUBLISH_DIR,
    `${packageId}.${readXmlVersionTag(AVALONIA_VERSION_PROPS)}.nupkg`,
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Packed archive not found: ${artifactPath}`);
  }

  return artifactPath;
}

function copyArtifactToPublishDir(artifactPath: string): void {
  const destinationPath = path.resolve(PUBLISH_DIR, path.basename(artifactPath));
  if (artifactPath !== destinationPath) {
    fs.copyFileSync(artifactPath, destinationPath);
  }
  console.log(`  Published ${path.relative(ROOT_DIR, destinationPath)}`);
}

function updateXmlVersionTag(filePath: string, version: string): void {
  const content = fs.readFileSync(filePath, 'utf8');
  const versionPattern = /<Version>[^<]*<\/Version>/;
  if (!versionPattern.test(content)) {
    throw new Error(`Version tag not found in ${filePath}`);
  }

  const updatedContent = content.replace(
    versionPattern,
    `<Version>${version}</Version>`,
  );

  fs.writeFileSync(filePath, updatedContent);
}

function resetDirectory(directoryPath: string): void {
  fs.rmSync(directoryPath, { recursive: true, force: true });
  fs.mkdirSync(directoryPath, { recursive: true });
}

function removeDirectoryIfExists(directoryPath: string): void {
  fs.rmSync(directoryPath, { recursive: true, force: true });
}

function readXmlVersionTag(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/<Version>([^<]*)<\/Version>/);
  if (!match) {
    throw new Error(`Version tag not found in ${filePath}`);
  }
  return match[1];
}
