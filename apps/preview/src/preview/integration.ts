export type PackageTabId = 'react' | 'svelte' | 'avalonia' | 'wpf';

const packageTabStorageKey = 'fluentui-icons-like:active-package-tab';

export function getStoredPackageTab(): PackageTabId {
  if (typeof window === 'undefined') return 'react';

  try {
    const storedTab = window.localStorage.getItem(packageTabStorageKey);
    return isPackageTabId(storedTab) ? storedTab : 'react';
  } catch {
    return 'react';
  }
}

export function setStoredPackageTab(tab: PackageTabId) {
  try {
    window.localStorage.setItem(packageTabStorageKey, tab);
  } catch {
    return;
  }
}

export function isPackageTabId(value: string | null): value is PackageTabId {
  return (
    value === 'react' ||
    value === 'svelte' ||
    value === 'avalonia' ||
    value === 'wpf'
  );
}
