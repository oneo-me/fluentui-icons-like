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
  innerContent: string;
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
