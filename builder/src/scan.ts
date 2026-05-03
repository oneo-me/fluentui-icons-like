import fs from 'node:fs';
import path from 'node:path';
import { ASSETS_DIR } from './constants.js';
import type { IconDefinition, IconMeta, IconSource } from './types.js';
import {
  extractSvgContent,
  toPascalCaseWithUnderscores,
  toSnakeCase,
} from './utils.js';

export function scanIcons(): IconDefinition[] {
  const iconDirs = fs
    .readdirSync(ASSETS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  console.log(`Found ${iconDirs.length} icon directories`);

  const icons: IconDefinition[] = [];

  for (const dirName of iconDirs) {
    const metaPath = path.join(ASSETS_DIR, dirName, 'metadata.json');
    if (!fs.existsSync(metaPath)) {
      console.warn(`  Skipping ${dirName}: no metadata.json`);
      continue;
    }

    const meta: IconMeta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const svgDir = path.join(ASSETS_DIR, dirName, 'SVG');
    const sources: IconSource[] = [];

    for (const size of meta.size) {
      for (const style of meta.style) {
        const snakeName = toSnakeCase(meta.name);
        let svgFilename = `ic_fluent_${snakeName}_${size}_${style.toLowerCase()}.svg`;
        let svgPath = path.join(svgDir, svgFilename);

        if (!fs.existsSync(svgPath)) {
          const suffix =
            meta.directionType === 'unique'
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

        const svgContent = fs.readFileSync(svgPath, 'utf-8');
        const svgData = extractSvgContent(svgContent);
        if (!svgData) {
          console.warn(`  Skipping ${svgFilename}: could not extract SVG data`);
          continue;
        }

        sources.push({
          size,
          style,
          viewBox: svgData.viewBox,
          nodes: svgData.nodes,
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
      keyword: meta.keyword ?? 'fluent-icon',
      description: meta.description ?? '',
      metaphor: meta.metaphor ?? [],
      directionType: meta.directionType ?? null,
      singleton: meta.singleton ?? null,
      sources,
    });
  }

  console.log(`Parsed ${icons.length} icons`);
  return icons;
}
