import { SIZE_PRIORITY } from './constants.js';

export function toSnakeCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

export function toPascalCaseWithUnderscores(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_');
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function extractSvgContent(
  svgContent: string,
): { viewBox: string; innerContent: string } | null {
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) return null;
  const contentMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
  if (!contentMatch) return null;
  return { viewBox: viewBoxMatch[1], innerContent: contentMatch[1].trim() };
}

export function pickBestSize(availableSizes: number[]): number {
  for (const size of SIZE_PRIORITY) {
    if (availableSizes.includes(size)) return size;
  }
  return availableSizes[0];
}

export function naturalCompare(a: string, b: string): number {
  const regex = /(\d+|\D+)/g;
  const aParts = a.match(regex) || [];
  const bParts = b.match(regex) || [];

  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];

    const aNum = parseInt(aPart, 10);
    const bNum = parseInt(bPart, 10);

    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
      const diff = aNum - bNum;
      if (diff !== 0) return diff;
    } else {
      const diff = aPart.localeCompare(bPart);
      if (diff !== 0) return diff;
    }
  }

  return aParts.length - bParts.length;
}

export function toTypeUnion(values: Array<number | string>): string {
  return values
    .map((value) => (typeof value === 'number' ? value : `'${value}'`))
    .join(' | ');
}
