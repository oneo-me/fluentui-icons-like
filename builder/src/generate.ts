import fs from 'node:fs';
import path from 'node:path';
import { resolve } from 'node:path';

const ROOT_DIR = resolve(import.meta.dirname, '..', '..');
const ASSETS_DIR = resolve(ROOT_DIR, '.cache', 'source', 'assets');
const OUTPUT_DIR = resolve(ROOT_DIR, 'packages', 'svelte');

const SIZE_PRIORITY = [20, 24, 16, 28, 32, 48, 12];

function toSnakeCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function toPascalCaseWithUnderscores(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('_');
}

function extractSvgData(svgContent: string): { viewBox: string; pathData: string } | null {
  const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
  const pathMatch = svgContent.match(/<path\s[^>]*\bd="([^"]*)"/);
  if (!viewBoxMatch || !pathMatch) return null;
  return { viewBox: viewBoxMatch[1], pathData: pathMatch[1] };
}

function pickBestSize(availableSizes: number[]): number {
  for (const size of SIZE_PRIORITY) {
    if (availableSizes.includes(size)) return size;
  }
  return availableSizes[0];
}

function formatPathData(d: string, viewBox: string, defaultSize: number): string {
  const bounds = viewBox.split(' ').map(Number);
  const maxX = bounds[2];
  const maxY = bounds[3];
  return `${d} M 0 0 M ${maxX} ${maxY}`;
}

interface IconMeta {
  name: string;
  size: number[];
  style: string[];
  keyword: string | null;
  description: string | null;
  metaphor: string[] | null;
  directionType?: string | null;
}

interface IconVariant {
  name: string;
  style: string;
  size: number;
  viewBox: string;
  pathData: string;
  keyword: string;
  description: string;
  metaphor: string[];
  directionType?: string;
}

function generateIconSvelte(variant: IconVariant): string {
  const title = `${variant.name}_${variant.style}`;
  const formattedPath = formatPathData(variant.pathData, variant.viewBox, variant.size);

  return `<script>
  import IconBase from "../components/icon-base.svelte";

  /**
   * @type {import('svelte/elements').SVGAttributes<SVGSVGElement> & {
   *   size?: number;
   *   class?: string;
   * }}
   */
  let { size, class: className, ...others } = $props();
</script>

<IconBase
    title="${title}"
    viewBox="${variant.viewBox}"
    data="${formattedPath}"
    {size}
    class={className}
    {...others}
/>
`;
}

function generateIconBaseSvelte(): string {
  return `<script>
  /**
   * @type {import('svelte/elements').SVGAttributes<SVGSVGElement> & {
   *   title?: string | null;
   *   data?: string | null;
   *   size?: number;
   *   viewBox?: string;
   * }}
   */
  let {
    title = null,
    data = null,
    size = 22,
    viewBox,
    ...others
  } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  {viewBox}
  style="width: {size}px; height: {size}px"
  {...others}
>
  {#if title}
    <title>{title}</title>
  {/if}
  <path d={data} />
</svg>

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
}

function generateIconsRegistry(variants: IconVariant[]): string {
  const imports = variants
    .map((v) => {
      const filename = `${toPascalCaseWithUnderscores(v.name)}_${v.style}`;
      return `import ${filename} from './src/lib/icons/${filename}.svelte';`;
    })
    .join('\n');

  const entries = variants
    .map((v) => {
      const filename = `${toPascalCaseWithUnderscores(v.name)}_${v.style}`;
      return `  { key: '${filename}', value: ${filename} },`;
    })
    .join('\n');

  return `${imports}

export default [
${entries}
];
`;
}

function writeIconFiles(variants: IconVariant[], iconsDir: string): string[] {
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const files: string[] = [];
  for (const variant of variants) {
    const filename = `${toPascalCaseWithUnderscores(variant.name)}_${variant.style}.svelte`;
    const content = generateIconSvelte(variant);
    fs.writeFileSync(path.join(iconsDir, filename), content);
    files.push(filename);
  }
  return files;
}

export function generate(): void {
  console.log('Generating Svelte icon components...');

  const iconDirs = fs.readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  console.log(`Found ${iconDirs.length} icon directories`);

  const variants: IconVariant[] = [];

  for (const dirName of iconDirs) {
    const metaPath = path.join(ASSETS_DIR, dirName, 'metadata.json');
    if (!fs.existsSync(metaPath)) {
      console.warn(`  Skipping ${dirName}: no metadata.json`);
      continue;
    }

    const meta: IconMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const svgDir = path.join(ASSETS_DIR, dirName, 'SVG');
    const bestSize = pickBestSize(meta.size);

    for (const style of meta.style) {
      const snakeName = toSnakeCase(meta.name);
      const svgFilename = `ic_fluent_${snakeName}_${bestSize}_${style.toLowerCase()}.svg`;
      const svgPath = path.join(svgDir, svgFilename);

      if (!fs.existsSync(svgPath)) {
        console.warn(`  Skipping ${svgFilename}: file not found`);
        continue;
      }

      const svgContent = fs.readFileSync(svgPath, 'utf-8');
      const svgData = extractSvgData(svgContent);
      if (!svgData) {
        console.warn(`  Skipping ${svgFilename}: could not extract SVG data`);
        continue;
      }

      variants.push({
        name: meta.name,
        style,
        size: bestSize,
        viewBox: svgData.viewBox,
        pathData: svgData.pathData,
        keyword: meta.keyword ?? 'fluent-icon',
        description: meta.description ?? '',
        metaphor: meta.metaphor ?? [],
        directionType: meta.directionType ?? undefined,
      });
    }
  }

  console.log(`Found ${variants.length} icon variants`);

  // Write icon-base.svelte
  const componentsDir = path.join(OUTPUT_DIR, 'src', 'lib', 'components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  fs.writeFileSync(path.join(componentsDir, 'icon-base.svelte'), generateIconBaseSvelte());
  console.log('  Written icon-base.svelte');

  // Write icon files
  const iconsDir = path.join(OUTPUT_DIR, 'src', 'lib', 'icons');
  const writtenFiles = writeIconFiles(variants, iconsDir);
  console.log(`  Written ${writtenFiles.length} icon component files`);

  // Write icons registry for demo
  const registryContent = generateIconsRegistry(variants);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'icons.ts'), registryContent);
  console.log('  Written icons.ts registry');

  console.log('Done.');
}
