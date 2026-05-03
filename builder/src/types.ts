export interface IconMeta {
  name: string;
  size: number[];
  style: string[];
  keyword: string | null;
  description: string | null;
  metaphor: string[] | null;
  directionType?: string;
  singleton?: string;
}

export interface IconSource {
  size: number;
  style: string;
  viewBox: string;
  nodes: SvgNode[];
}

export type SvgNode = SvgElementNode | SvgTextNode;

export interface SvgElementNode {
  type: 'element';
  name: string;
  attributes: Record<string, string>;
  children: SvgNode[];
}

export interface SvgTextNode {
  type: 'text';
  value: string;
}

export interface IconDefinition {
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
