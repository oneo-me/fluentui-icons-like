import fs from "node:fs";
import path, { resolve } from "node:path";

const ROOT_DIR = resolve(import.meta.dirname, "..", "..");
const ASSETS_DIR = resolve(ROOT_DIR, ".cache", "source", "assets");
const OUTPUT_DIR = resolve(ROOT_DIR, "packages", "svelte");
const LIB_DIR = path.join(OUTPUT_DIR, "src", "lib");

const SIZE_PRIORITY = [20, 24, 16, 28, 32, 48, 12];

function toSnakeCase(name: string): string {
	return name
		.toLowerCase()
		.replace(/\s+/g, "_")
		.replace(/[^a-z0-9_]/g, "");
}

function toPascalCaseWithUnderscores(name: string): string {
	return name
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join("_");
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function extractSvgContent(
	svgContent: string,
): { viewBox: string; innerContent: string } | null {
	const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
	if (!viewBoxMatch) return null;
	const contentMatch = svgContent.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
	if (!contentMatch) return null;
	return { viewBox: viewBoxMatch[1], innerContent: contentMatch[1].trim() };
}

function pickBestSize(availableSizes: number[]): number {
	for (const size of SIZE_PRIORITY) {
		if (availableSizes.includes(size)) return size;
	}
	return availableSizes[0];
}

interface IconMeta {
	name: string;
	size: number[];
	style: string[];
	keyword: string | null;
	description: string | null;
	metaphor: string[] | null;
	directionType?: string;
	singleton?: string;
}

interface IconSource {
	size: number;
	style: string;
	viewBox: string;
	innerContent: string;
}

interface IconDefinition {
	key: string;
	name: string;
	sizes: number[];
	styles: string[];
	keyword: string;
	description: string;
	metaphor: string[];
	directionType: string | null;
	singleton: string | null;
	sources: IconSource[];
}

function toTypeUnion(values: Array<number | string>): string {
	return values
		.map((value) => (typeof value === "number" ? value : `'${value}'`))
		.join(" | ");
}

function generateIconSvelte(icon: IconDefinition): string {
	const defaultSize = pickBestSize(icon.sizes);
	const defaultStyle = icon.styles.includes("Regular")
		? "Regular"
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
}

function generateLibraryIndex(icons: IconDefinition[]): string {
	const filenames = icons.map((icon) => icon.key);
	const sortedFilenames = [...filenames].sort((a, b) => a.localeCompare(b));
	const iconStyles = Array.from(
		new Set(icons.flatMap((icon) => icon.styles)),
	).sort((a, b) => a.localeCompare(b));

	const imports = sortedFilenames
		.map((filename) => `import ${filename} from './icons/${filename}.svelte';`)
		.join("\n");

	const exports = sortedFilenames
		.map(
			(filename) =>
				`export { default as ${filename} } from './icons/${filename}.svelte';`,
		)
		.join("\n");

	const entries = filenames
		.map((filename) => {
			const icon = icons.find((item) => item.key === filename);
			if (!icon) return "";
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
		.join("\n");

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

function emptyGeneratedIconFiles(iconsDir: string): void {
	if (!fs.existsSync(iconsDir)) return;

	for (const filename of fs.readdirSync(iconsDir)) {
		if (filename.endsWith(".svelte")) {
			fs.unlinkSync(path.join(iconsDir, filename));
		}
	}
}

function writeIconFiles(icons: IconDefinition[], iconsDir: string): string[] {
	if (!fs.existsSync(iconsDir)) {
		fs.mkdirSync(iconsDir, { recursive: true });
	}

	const files: string[] = [];
	for (const icon of icons) {
		const filename = `${icon.key}.svelte`;
		const content = generateIconSvelte(icon);
		fs.writeFileSync(path.join(iconsDir, filename), content);
		files.push(filename);
	}
	return files;
}

export function generate(): void {
	console.log("Generating Svelte icon components...");

	const iconDirs = fs
		.readdirSync(ASSETS_DIR, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);

	console.log(`Found ${iconDirs.length} icon directories`);

	const icons: IconDefinition[] = [];

	for (const dirName of iconDirs) {
		const metaPath = path.join(ASSETS_DIR, dirName, "metadata.json");
		if (!fs.existsSync(metaPath)) {
			console.warn(`  Skipping ${dirName}: no metadata.json`);
			continue;
		}

		const meta: IconMeta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
		const svgDir = path.join(ASSETS_DIR, dirName, "SVG");
		const sources: IconSource[] = [];

		for (const size of meta.size) {
			for (const style of meta.style) {
				const snakeName = toSnakeCase(meta.name);
				let svgFilename = `ic_fluent_${snakeName}_${size}_${style.toLowerCase()}.svg`;
				let svgPath = path.join(svgDir, svgFilename);

				if (!fs.existsSync(svgPath)) {
					const suffix =
						meta.directionType === "unique"
							? meta.singleton?.toLowerCase()
							: undefined;
					if (suffix) {
						const altFilename = `ic_fluent_${snakeName}_${size}_${style.toLowerCase()}_${suffix}.svg`;
						const altPath = path.join(svgDir, altFilename);
						if (fs.existsSync(altPath)) {
							svgFilename = altFilename;
							svgPath = altPath;
						}
					}
				}

				if (!fs.existsSync(svgPath)) {
					console.warn(`  Skipping ${svgFilename}: file not found`);
					continue;
				}

				const svgContent = fs.readFileSync(svgPath, "utf-8");
				const svgData = extractSvgContent(svgContent);
				if (!svgData) {
					console.warn(`  Skipping ${svgFilename}: could not extract SVG data`);
					continue;
				}

				sources.push({
					size,
					style,
					viewBox: svgData.viewBox,
					innerContent: svgData.innerContent,
				});
			}
		}

		if (sources.length === 0) {
			console.warn(`  Skipping ${dirName}: no SVG sources found`);
			continue;
		}

		const actualSizes = [...new Set(sources.map((s) => s.size))];
		const actualStyles = [...new Set(sources.map((s) => s.style))];

		icons.push({
			key: toPascalCaseWithUnderscores(meta.name),
			name: meta.name,
			sizes: actualSizes,
			styles: actualStyles,
			keyword: meta.keyword ?? "fluent-icon",
			description: meta.description ?? "",
			metaphor: meta.metaphor ?? [],
			directionType: meta.directionType ?? null,
			singleton: meta.singleton ?? null,
			sources,
		});
	}

	console.log(`Found ${icons.length} icons`);

	// Write icon files
	const iconsDir = path.join(LIB_DIR, "icons");
	emptyGeneratedIconFiles(iconsDir);
	const writtenFiles = writeIconFiles(icons, iconsDir);
	console.log(`  Written ${writtenFiles.length} icon component files`);

	// Write package entrypoint
	fs.writeFileSync(path.join(LIB_DIR, "index.ts"), generateLibraryIndex(icons));
	console.log("  Written library index.ts");

	console.log("Done.");
}
