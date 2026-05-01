import fs from 'node:fs';
import path from 'node:path';
import type { Generator } from './generators/types.js';
import type { IconDefinition } from './types.js';

export function generate(generator: Generator, icons: IconDefinition[]): void {
  console.log(`Generating ${generator.name} icon components...`);

  if (fs.existsSync(generator.iconsDir)) {
    for (const filename of fs.readdirSync(generator.iconsDir)) {
      fs.unlinkSync(path.join(generator.iconsDir, filename));
    }
  }

  fs.mkdirSync(generator.iconsDir, { recursive: true });

  for (const icon of icons) {
    const filename = generator.getIconFileName(icon);
    const content = generator.generateIcon(icon);
    fs.writeFileSync(path.join(generator.iconsDir, filename), content);
  }

  fs.mkdirSync(path.dirname(generator.indexPath), { recursive: true });
  fs.writeFileSync(generator.indexPath, generator.generateIndex(icons));

  console.log(`  Written ${icons.length} icon files`);
  console.log(`  Written ${path.relative(process.cwd(), generator.indexPath)}`);
  console.log('Done.');
}
