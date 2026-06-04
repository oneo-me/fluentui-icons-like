import type { IconDefinition } from '../types.js';

export interface Generator {
  name: string;
  generate(icons: IconDefinition[]): GeneratedFile[];
}

export interface GeneratedFile {
  path: string;
  content: string;
}
