import { resolve } from 'node:path';

export const ROOT_DIR = resolve(import.meta.dirname, '..', '..');
export const ASSETS_DIR = resolve(ROOT_DIR, '.cache', 'source', 'assets');
export const SIZE_PRIORITY = [20, 24, 16, 28, 32, 48, 12];
