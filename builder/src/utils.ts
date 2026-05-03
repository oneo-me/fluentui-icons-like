import { SIZE_PRIORITY } from './constants.js';
import type { SvgElementNode, SvgNode } from './types.js';

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
): { viewBox: string; nodes: SvgNode[] } | null {
  const document = parseSvgDocument(svgContent);
  const svg = document.children.find(
    (node): node is SvgElementNode =>
      node.type === 'element' && node.name === 'svg',
  );
  if (!svg) return null;
  const viewBox = svg.attributes.viewBox;
  if (!viewBox) return null;
  return {
    viewBox,
    nodes: svg.children.map(normalizeSvgNodeColor),
  };
}

function parseSvgDocument(svgContent: string): SvgElementNode {
  const root: SvgElementNode = {
    type: 'element',
    name: '#document',
    attributes: {},
    children: [],
  };
  const stack = [root];
  const tokenPattern =
    /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?]]>|<\?[\s\S]*?\?>|<![^>]*>|<\/?[^>]+>/g;
  let currentIndex = 0;

  for (const match of svgContent.matchAll(tokenPattern)) {
    const token = match[0];
    const tokenIndex = match.index ?? 0;
    appendTextNode(
      stack.at(-1) ?? root,
      svgContent.slice(currentIndex, tokenIndex),
    );
    currentIndex = tokenIndex + token.length;

    if (
      token.startsWith('<!--') ||
      token.startsWith('<?') ||
      token.startsWith('<!')
    ) {
      continue;
    }

    if (token.startsWith('</')) {
      const tagName = token.slice(2, -1).trim();
      for (let i = stack.length - 1; i > 0; i--) {
        const node = stack[i];
        stack.pop();
        if (node.name === tagName) break;
      }
      continue;
    }

    const element = parseElementToken(token);
    if (!element) continue;
    const parent = stack.at(-1) ?? root;
    parent.children.push(element);
    if (!token.endsWith('/>')) {
      stack.push(element);
    }
  }

  appendTextNode(stack.at(-1) ?? root, svgContent.slice(currentIndex));
  return root;
}

function appendTextNode(parent: SvgElementNode, value: string): void {
  const normalizedValue = value.trim();
  if (!normalizedValue) return;
  parent.children.push({
    type: 'text',
    value: normalizedValue,
  });
}

function parseElementToken(token: string): SvgElementNode | null {
  const inner = token.slice(1, token.endsWith('/>') ? -2 : -1).trim();
  const nameMatch = inner.match(/^([^\s/>]+)/);
  if (!nameMatch) return null;
  const name = nameMatch[1];
  const attributesSource = inner.slice(name.length);
  const attributes: Record<string, string> = {};
  const attributePattern =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of attributesSource.matchAll(attributePattern)) {
    attributes[match[1]] = match[2] ?? match[3] ?? match[4] ?? '';
  }

  return {
    type: 'element',
    name,
    attributes,
    children: [],
  };
}

function normalizeSvgNodeColor(node: SvgNode): SvgNode {
  if (node.type === 'text') return node;
  const attributes = { ...node.attributes };
  for (const attributeName of ['fill', 'stroke']) {
    const value = attributes[attributeName];
    if (value && value !== 'none' && value !== 'currentColor') {
      attributes[attributeName] = 'currentColor';
    }
  }
  return {
    ...node,
    attributes,
    children: node.children.map(normalizeSvgNodeColor),
  };
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
