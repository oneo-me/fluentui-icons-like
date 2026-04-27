import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const REPO_URL = 'git@github.com:microsoft/fluentui-system-icons.git';

function getRootDir(): string {
  return resolve(import.meta.dirname, '..', '..');
}

function getSourceDir(): string {
  return resolve(getRootDir(), '.cache', 'source');
}

export function syncSource(): void {
  const sourceDir = getSourceDir();

  if (existsSync(sourceDir)) {
    console.log(`Source exists at ${sourceDir}, pulling latest...`);
    execSync('git pull --ff-only', { cwd: sourceDir, stdio: 'inherit' });
  } else {
    console.log(`Cloning ${REPO_URL} to ${sourceDir}...`);
    execSync(`git clone --depth 1 ${REPO_URL} "${sourceDir}"`, { stdio: 'inherit' });
  }
}
