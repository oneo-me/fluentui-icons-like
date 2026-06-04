import fs from 'node:fs';
import path from 'node:path';
import type { Generator } from './generators/types.js';
import type { IconDefinition } from './types.js';

export function generate(generator: Generator, icons: IconDefinition[]): void {
  console.log(`Generating ${generator.name} icon components...`);
  const generatedFiles = generator.generate(icons);

  for (const file of generatedFiles) {
    fs.mkdirSync(path.dirname(file.path), { recursive: true });
    fs.writeFileSync(file.path, file.content);
    console.log(`  Written ${path.relative(process.cwd(), file.path)}`);
  }

  console.log(`  Written ${generatedFiles.length} generated files`);
  console.log('Done.');
}
