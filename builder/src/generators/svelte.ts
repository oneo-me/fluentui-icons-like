import { resolve } from 'node:path';
import { ROOT_DIR } from '../constants.js';
import type { IconDefinition } from '../types.js';
import {
  escapeXml,
  naturalCompare,
  pickBestSize,
  toTypeUnion,
} from '../utils.js';
import type { Generator } from './types.js';

const PACKAGE_DIR = resolve(ROOT_DIR, 'packages', 'svelte');

export const svelteGenerator: Generator = {
  name: 'svelte',
  iconsDir: resolve(PACKAGE_DIR, 'src', 'lib', 'icons'),
  indexPath: resolve(PACKAGE_DIR, 'src', 'lib', 'index.ts'),

  getIconFileName(icon: IconDefinition): string {
    return `${icon.key}.svelte`;
  },

  generateIcon(icon: IconDefinition): string {
    const defaultSize = pickBestSize(icon.sizes);
    const defaultStyle = icon.styles.includes('Regular')
      ? 'Regular'
      : icon.styles[0];
    const sizeType = toTypeUnion(icon.sizes);
    const styleType = toTypeUnion(icon.styles);
    const sourcesBySize = icon.sources.reduce<
      Record<number, Record<string, { viewBox: string; innerContent: string }>>
    >((acc, source) => {
      acc[source.size] ??= {};
      acc[source.size][source.style] = {
        viewBox: source.viewBox,
        innerContent: source.innerContent,
      };
      return acc;
    }, {});
    const sourceData = JSON.stringify(sourcesBySize, null, 2);
    const escapedTitle = escapeXml(icon.name);

    return `<script>
  /**
   * @typedef {{ viewBox: string; innerContent: string }} IconSourceData
   */

  /**
   * @type {Record<number, Record<string, IconSourceData>>}
   */
  const paths = ${sourceData};
  const defaultSize = ${defaultSize};
  const defaultStyle = '${defaultStyle}';

  /**
   * @typedef {${sizeType}} IconAssetSize
   * @typedef {${styleType}} IconStyle
   */

  /**
   * @type {Omit<import('svelte/elements').SVGAttributes<SVGSVGElement>, 'style' | 'title'> & {
   *   size?: IconAssetSize | number;
   *   style?: string;
   *   title?: string | null;
   * }}
   */
  let {
    size = defaultSize,
    style = defaultStyle,
    title = '${escapedTitle}',
    ...others
  } = $props();

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
    {@html source.innerContent}
  </svg>
{/if}

<style>
  svg {
    stroke: currentColor;
    fill: currentColor;
    stroke-width: 0;
    width: 100%;
    height: auto;
    max-height: 100%;
  }
</style>
`;
  },

  generateIndex(icons: IconDefinition[]): string {
    const filenames = icons.map((icon) => icon.key);
    const sortedFilenames = [...filenames].sort(naturalCompare);
    const iconStyles = Array.from(
      new Set(icons.flatMap((icon) => icon.styles)),
    ).sort((a, b) => a.localeCompare(b));

    const imports = sortedFilenames
      .map(
        (filename) => `import ${filename} from './icons/${filename}.svelte';`,
      )
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
  },
};
