export interface PreviewSearch {
  q?: string;
  size?: number;
  style?: string;
  metaphor?: string;
  icon?: string;
  color?: string;
  scale?: number;
}

const validScales = new Set([1, 2, 3]);
const hexColorRe = /^#[0-9a-f]{6}$/i;

export function sanitizeSearch(search: Record<string, unknown>): PreviewSearch {
  const next: PreviewSearch = {};
  const q = readString(search.q).trim();
  const size = readNumber(search.size);
  const style = readString(search.style).trim();
  const metaphor = readString(search.metaphor).trim();
  const icon = readString(search.icon).trim();
  const color = readString(search.color).trim();
  const scale = readNumber(search.scale);

  if (q) next.q = q;
  if (size > 0) next.size = size;
  if (style) next.style = style;
  if (metaphor) next.metaphor = metaphor;
  if (icon) next.icon = icon;
  if (hexColorRe.test(color)) next.color = color.toLowerCase();
  if (validScales.has(scale)) next.scale = scale;

  return next;
}

export function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

export function readNumber(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function toUrlSearch(search: PreviewSearch): PreviewSearch {
  const next: PreviewSearch = {};
  if (search.q) next.q = search.q;
  if (search.size && search.size !== 20) next.size = search.size;
  if (search.style && search.style !== 'Regular') next.style = search.style;
  if (search.metaphor) next.metaphor = search.metaphor;
  if (search.icon) next.icon = search.icon;
  if (search.color) next.color = search.color;
  if (search.scale && search.scale !== 1) next.scale = search.scale;
  return next;
}

export function searchKey(search: PreviewSearch): string {
  return JSON.stringify(toUrlSearch(search));
}
