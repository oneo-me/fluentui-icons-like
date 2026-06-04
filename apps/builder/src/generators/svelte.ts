import { resolve } from 'node:path';
import { ROOT_DIR } from '../constants.js';
import type { IconDefinition, SvgNode } from '../types.js';
import { escapeXml, pickBestSize, toTypeUnion } from '../utils.js';
import type { Generator } from './types.js';

const PACKAGE_DIR = resolve(ROOT_DIR, 'packages', 'svelte');
const ICONS_DIR = resolve(PACKAGE_DIR, 'src', 'lib', 'icons');

const COMPONENT_PREFIX = 'FluentIcon';

function getComponentName(icon: IconDefinition): string {
  return `${COMPONENT_PREFIX}${icon.key.replace(/_/g, '')}`;
}

export const svelteGenerator: Generator = {
  name: 'svelte',
  generate(icons: IconDefinition[]) {
    return icons.map((icon) => ({
      path: resolve(ICONS_DIR, `${getComponentName(icon)}.svelte`),
      content: generateIcon(icon),
    }));
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
