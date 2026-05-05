import { resolve } from 'node:path';
import { ROOT_DIR } from '../constants.js';
import type { IconDefinition, SvgNode } from '../types.js';
import { naturalCompare } from '../utils.js';
import type { Generator } from './types.js';

const RUNTIME_DIR = resolve(ROOT_DIR, 'packages', 'avalonia', 'FluentUIIconsLike');
const GENERATOR_DIR = resolve(
  ROOT_DIR,
  'packages',
  'avalonia',
  'FluentUIIconsLike.Generator',
);

interface AvaloniaIconRecord {
  symbol: string;
  variants: AvaloniaIconVariantRecord[];
}

interface AvaloniaIconVariantRecord {
  size: number;
  style: string;
  viewBox: string;
  pathData: string;
}

export const avaloniaGenerator: Generator = {
  name: 'avalonia',
  generate(icons) {
    const records = toIconRecords(icons);

    return [
      {
        path: resolve(RUNTIME_DIR, 'Generated', 'FluentIconSymbol.g.cs'),
        content: generateSymbolEnum(records),
      },
      {
        path: resolve(GENERATOR_DIR, 'Assets', 'fluent-icons.json'),
        content: JSON.stringify(records, null, 2),
      },
    ];
  },
};

function toIconRecords(icons: IconDefinition[]): AvaloniaIconRecord[] {
  return icons
    .map((icon) => ({
      symbol: toSymbolName(icon.name),
      variants: icon.sources
        .filter((source) => isSupportedSource(source.nodes))
        .map((source) => ({
          size: source.size,
          style: source.style,
          viewBox: source.viewBox,
          pathData: buildPathData(source.nodes),
        }))
        .filter((source) => source.pathData.length > 0)
        .sort((a, b) => a.size - b.size || naturalCompare(a.style, b.style)),
    }))
    .filter((icon) => icon.variants.length > 0)
    .sort((a, b) => naturalCompare(a.symbol, b.symbol));
}

function generateSymbolEnum(records: AvaloniaIconRecord[]): string {
  const members = records.map((record) => `    ${record.symbol},`).join('\n');
  const styles = Array.from(
    new Set(records.flatMap((record) => record.variants.map((variant) => variant.style))),
  ).sort(naturalCompare);
  const styleMembers = styles.map((style) => `    ${toStyleName(style)},`).join('\n');

  return `namespace FluentUIIconsLike;

public enum FluentIconSymbol
{
${members}
}

public enum FluentIconStyle
{
${styleMembers}
}
`;
}

function isSupportedSource(nodes: SvgNode[]): boolean {
  return nodes.every(isSupportedNode);
}

function isSupportedNode(node: SvgNode): boolean {
  if (node.type === 'text') {
    return node.value.trim().length === 0;
  }

  if (node.name === 'path') {
    return typeof node.attributes.d === 'string' && node.attributes.d.length > 0;
  }

  if (node.name === 'g') {
    return node.children.every(isSupportedNode);
  }

  return false;
}

function buildPathData(nodes: SvgNode[]): string {
  return nodes
    .flatMap(flattenPathData)
    .filter((part) => part.length > 0)
    .join(' ')
    .trim();
}

function flattenPathData(node: SvgNode): string[] {
  if (node.type === 'text') {
    return [];
  }

  if (node.name === 'path') {
    const data = node.attributes.d?.trim();
    return data ? [data] : [];
  }

  if (node.name === 'g') {
    return node.children.flatMap(flattenPathData);
  }

  return [];
}

function toSymbolName(value: string): string {
  const words = value.match(/[A-Za-z0-9]+/g) ?? [];
  const sanitized = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return /^[A-Za-z_]/.test(sanitized) ? sanitized : `_${sanitized}`;
}

function toStyleName(value: string): string {
  return toSymbolName(value);
}
