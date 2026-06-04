import type { ComponentType, SVGAttributes } from 'react';
import metadataUrl from './icons.json?url';

export type PreviewIconStyle = string;

export type PreviewIconProps = Omit<SVGAttributes<SVGSVGElement>, 'title'> & {
  size?: number;
  variant?: PreviewIconStyle;
  title?: string | null;
};

export type PreviewIconComponent = ComponentType<PreviewIconProps>;
export type PreviewIconModule = { default: PreviewIconComponent };

export interface PreviewIconMetadata {
  key: string;
  name: string;
  sizes: number[];
  styles: PreviewIconStyle[];
  keyword: string;
  description: string;
  metaphor: string[];
  directionType: string | null;
  singleton: string | null;
}

export interface PreviewIconEntry extends PreviewIconMetadata {
  load: () => Promise<PreviewIconModule>;
}

const loaders = import.meta.glob(
  '../../../../packages/react/src/icons/FluentIcon*.ts',
) as Record<string, () => Promise<PreviewIconModule>>;

function getComponentName(key: string): string {
  return `FluentIcon${key.replace(/_/g, '')}`;
}

function getLoader(key: string): () => Promise<PreviewIconModule> {
  const componentName = getComponentName(key);
  const loader =
    loaders[`../../../../packages/react/src/icons/${componentName}.ts`];
  if (!loader) {
    throw new Error(`Icon module not found: ${componentName}`);
  }
  return loader;
}

let cached: Promise<PreviewIconEntry[]> | null = null;

export function loadRegistry(): Promise<PreviewIconEntry[]> {
  if (!cached) {
    cached = loadMetadata().then((metadata) =>
      metadata.map((entry) => ({
        ...entry,
        load: getLoader(entry.key),
      })),
    );
  }
  return cached;
}

async function loadMetadata(): Promise<PreviewIconMetadata[]> {
  const response = await fetch(metadataUrl);
  if (!response.ok) {
    throw new Error(`Unable to load icon metadata: ${response.status}`);
  }
  return (await response.json()) as PreviewIconMetadata[];
}
