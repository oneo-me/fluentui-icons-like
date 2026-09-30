import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROOT_DIR } from './constants.js';

const REPO_URL = 'https://github.com/microsoft/fluentui-system-icons.git';

function getSourceDir(): string {
  return resolve(ROOT_DIR, '.cache', 'source');
}

export function syncSource(): void {
  const sourceDir = getSourceDir();

  if (existsSync(sourceDir)) {
    console.log(`Source exists at ${sourceDir}, pulling latest...`);
    execFileSync('git', ['pull', '--ff-only'], {
      cwd: sourceDir,
      stdio: 'inherit',
    });
  } else {
    console.log(`Cloning ${REPO_URL} to ${sourceDir}...`);
    execFileSync('git', ['clone', '--depth', '1', REPO_URL, sourceDir], {
      stdio: 'inherit',
    });
  }
}
