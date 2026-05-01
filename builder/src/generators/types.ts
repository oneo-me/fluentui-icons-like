import type { IconDefinition } from '../types.js';

export interface Generator {
  name: string;
  iconsDir: string;
  indexPath: string;
  generateIcon(icon: IconDefinition): string;
  getIconFileName(icon: IconDefinition): string;
  generateIndex(icons: IconDefinition[]): string;
}
