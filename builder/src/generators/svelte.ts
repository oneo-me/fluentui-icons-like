import { resolve } from 'node:path';
import { ROOT_DIR } from '../constants.js';
import type { IconDefinition, SvgNode } from '../types.js';
import {
  escapeXml,
  naturalCompare,
  pickBestSize,
  toTypeUnion,
} from '../utils.js';
import type { Generator } from './types.js';

const PACKAGE_DIR = resolve(ROOT_DIR, 'packages', 'svelte');
const ICONS_DIR = resolve(PACKAGE_DIR, 'src', 'lib', 'icons');
const INDEX_PATH = resolve(PACKAGE_DIR, 'src', 'lib', 'index.ts');

export const svelteGenerator: Generator = {
  name: 'svelte',
  generate(icons: IconDefinition[]) {
    const files = icons.map((icon) => ({
      path: resolve(ICONS_DIR, `${icon.key}.svelte`),
      content: generateIcon(icon),
    }));

    files.push({
      path: INDEX_PATH,
      content: generateIndex(icons),
    });

    return files;
  },
};

function generateIcon(icon: IconDefinition): string {
  const defaultSize = pickBestSize(icon.sizes);
  const defaultStyle = icon.styles.includes('Regular')
    ? 'Regular'
    : icon.styles[0];
  const sizeType = toTypeUnion(icon.sizes);
  const styleType = toTypeUnion(icon.styles);
  const sourcesBySize = icon.sources.reduce<
    Record<number, Record<string, { key: string; viewBox: string }>>
  >((acc, source) => {
    acc[source.size] ??= {};
    acc[source.size][source.style] = {
      key: getSourceKey(source.size, source.style),
      viewBox: source.viewBox,
    };
    return acc;
  }, {});
  const sourceData = JSON.stringify(sourcesBySize, null, 2);
  const escapedTitle = escapeXml(icon.name);
  const sourceBranches = icon.sources
    .map((source, index) => {
      const marker = index === 0 ? '{#if' : '{:else if';
      const markup = renderSvgNodes(source.nodes, 4);
      return `${marker} source.key === '${getSourceKey(source.size, source.style)}'}
${markup}
    ${index === icon.sources.length - 1 ? '{/if}' : ''}`;
    })
    .join('');

  return `<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';

  type IconSourceData = { key: string; viewBox: string };

  const paths: Record<number, Record<string, IconSourceData>> = ${sourceData};
  const defaultSize = ${defaultSize};
  const defaultStyle = '${defaultStyle}';

  type IconAssetSize = ${sizeType};
  type IconStyle = ${styleType};

  type IconProps = Omit<SVGAttributes<SVGSVGElement>, 'style' | 'title'> & {
    size?: IconAssetSize | number;
    style?: IconStyle | string;
    title?: string | null;
  };

  let {
    size = defaultSize,
    style = defaultStyle,
    title = '${escapedTitle}',
    ...others
  }: IconProps = $props();

  const source = $derived(
    paths[size]?.[style] ??
      paths[defaultSize]?.[style] ??
      paths[size]?.[defaultStyle] ??
      paths[defaultSize]?.[defaultStyle],
  );
</script>

{#if source}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox={source.viewBox}
    style={\`width: \${size}px; height: \${size}px\`}
    {...others}
  >
    {#if title}
      <title>{title}</title>
    {/if}
    ${sourceBranches}
  </svg>
{/if}

<style>
  svg {
    color: inherit;
    stroke: currentColor;
    fill: currentColor;
    stroke-width: 0;
    width: 100%;
    height: auto;
    max-height: 100%;
  }
</style>
`;
}

function generateIndex(icons: IconDefinition[]): string {
  const filenames = icons.map((icon) => icon.key);
  const sortedFilenames = [...filenames].sort(naturalCompare);
  const iconStyles = Array.from(
    new Set(icons.flatMap((icon) => icon.styles)),
  ).sort((a, b) => a.localeCompare(b));

  const imports = sortedFilenames
    .map((filename) => `import ${filename} from './icons/${filename}.svelte';`)
    .join('\n');

  const exports = sortedFilenames
    .map(
      (filename) =>
        `export { default as ${filename} } from './icons/${filename}.svelte';`,
    )
    .join('\n');

  const entries = sortedFilenames
    .map((filename) => {
      const icon = icons.find((item) => item.key === filename);
      if (!icon) return '';
      const metadata = {
        key: icon.key,
        name: icon.name,
        sizes: icon.sizes,
        styles: icon.styles,
        keyword: icon.keyword,
        description: icon.description,
        metaphor: icon.metaphor,
        directionType: icon.directionType,
        singleton: icon.singleton,
      };
      return `  { ...${JSON.stringify(metadata)}, value: ${filename} },`;
    })
    .filter(Boolean)
    .join('\n');

  return `import type { Component } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';

${imports}

${exports}

export type IconStyle = ${toTypeUnion(iconStyles)};

export type IconProps = Omit<SVGAttributes<SVGSVGElement>, 'style' | 'title'> & {
  size?: number;
  style?: IconStyle;
  title?: string | null;
};

export type IconComponent = Component<IconProps>;

export interface IconEntry {
  key: string;
  name: string;
  value: IconComponent;
  sizes: number[];
  styles: IconStyle[];
  keyword: string;
  description: string;
  metaphor: string[];
  directionType: string | null;
  singleton: string | null;
}

export const registry: IconEntry[] = [
${entries}
];
`;
}

function getSourceKey(size: number, style: string): string {
  return `${size}-${style}`;
}

function renderSvgNodes(nodes: SvgNode[], depth: number): string {
  return nodes.map((node) => renderSvgNode(node, depth)).join('\n');
}

function renderSvgNode(node: SvgNode, depth: number): string {
  const indent = '  '.repeat(depth);
  if (node.type === 'text') {
    return `${indent}${escapeXml(node.value)}`;
  }

  const attributes = Object.entries(node.attributes)
    .map(([name, value]) =>
      value ? `${name}="${escapeXml(value)}"` : `${name}`,
    )
    .join(' ');
  const openingTag = attributes ? `${node.name} ${attributes}` : node.name;

  if (node.children.length === 0) {
    return `${indent}<${openingTag} />`;
  }

  return `${indent}<${openingTag}>
${renderSvgNodes(node.children, depth + 1)}
${indent}</${node.name}>`;
}
