const pngColorStorageKey = 'fluentui-icons-like:png-color';
const keywordStorageKey = 'fluentui-icons-like:search-keyword';
const hexColorRe = /^#[0-9a-f]{6}$/i;

function readPreference(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

function writePreference(key: string, value: string) {
  if (typeof window === 'undefined') return;
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    // Preferences remain usable in memory when storage is unavailable.
  }
}

export function getStoredPngColor(): string {
  const color = readPreference(pngColorStorageKey);
  return hexColorRe.test(color) ? color.toLowerCase() : '';
}

export function setStoredPngColor(color: string) {
  writePreference(
    pngColorStorageKey,
    hexColorRe.test(color) ? color.toLowerCase() : '',
  );
}

export function getStoredKeyword(): string {
  return readPreference(keywordStorageKey);
}

export function setStoredKeyword(keyword: string) {
  writePreference(keywordStorageKey, keyword);
}
