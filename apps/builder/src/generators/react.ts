import { resolve } from 'node:path';
import { ROOT_DIR } from '../constants.js';
import type { IconDefinition, SvgNode } from '../types.js';
import { naturalCompare, pickBestSize, toTypeUnion } from '../utils.js';
import type { Generator } from './types.js';

const PACKAGE_DIR = resolve(ROOT_DIR, 'packages', 'react');
const ICONS_DIR = resolve(PACKAGE_DIR, 'src', 'icons');
const PREVIEW_DIR = resolve(ROOT_DIR, 'apps', 'preview', 'src', 'preview');
const PREVIEW_METADATA_PATH = resolve(PREVIEW_DIR, 'icons.json');

const COMPONENT_PREFIX = 'FluentIcon';

type ReactSvgNode = ReactSvgElementNode | ReactSvgTextNode;

interface ReactSvgElementNode {
  type: 'element';
  name: string;
  attributes: Record<string, string>;
  children: ReactSvgNode[];
}

interface ReactSvgTextNode {
  type: 'text';
  value: string;
}

const SVG_ATTRIBUTE_NAMES: Record<string, string> = {
  class: 'className',
  'accent-height': 'accentHeight',
  'alignment-baseline': 'alignmentBaseline',
  'baseline-shift': 'baselineShift',
  'clip-path': 'clipPath',
  'clip-rule': 'clipRule',
  'color-interpolation': 'colorInterpolation',
  'color-rendering': 'colorRendering',
  'dominant-baseline': 'dominantBaseline',
  'enable-background': 'enableBackground',
  'fill-opacity': 'fillOpacity',
  'fill-rule': 'fillRule',
  'flood-color': 'floodColor',
  'flood-opacity': 'floodOpacity',
  'font-family': 'fontFamily',
  'font-size': 'fontSize',
  'font-size-adjust': 'fontSizeAdjust',
  'font-stretch': 'fontStretch',
  'font-style': 'fontStyle',
  'font-variant': 'fontVariant',
  'font-weight': 'fontWeight',
  'glyph-name': 'glyphName',
  'glyph-orientation-horizontal': 'glyphOrientationHorizontal',
  'glyph-orientation-vertical': 'glyphOrientationVertical',
  'horiz-adv-x': 'horizAdvX',
  'horiz-origin-x': 'horizOriginX',
  'image-rendering': 'imageRendering',
  'letter-spacing': 'letterSpacing',
  'lighting-color': 'lightingColor',
  'marker-end': 'markerEnd',
  'marker-mid': 'markerMid',
  'marker-start': 'markerStart',
  'overline-position': 'overlinePosition',
  'overline-thickness': 'overlineThickness',
  'paint-order': 'paintOrder',
  'pointer-events': 'pointerEvents',
  'shape-rendering': 'shapeRendering',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'strikethrough-position': 'strikethroughPosition',
  'strikethrough-thickness': 'strikethroughThickness',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-opacity': 'strokeOpacity',
  'stroke-width': 'strokeWidth',
  'text-anchor': 'textAnchor',
  'text-decoration': 'textDecoration',
  'text-rendering': 'textRendering',
  'transform-origin': 'transformOrigin',
  'underline-position': 'underlinePosition',
  'underline-thickness': 'underlineThickness',
  'unicode-bidi': 'unicodeBidi',
  'vector-effect': 'vectorEffect',
  'vert-adv-y': 'vertAdvY',
  'vert-origin-x': 'vertOriginX',
  'vert-origin-y': 'vertOriginY',
  'word-spacing': 'wordSpacing',
  'writing-mode': 'writingMode',
  'x-height': 'xHeight',
  'xlink:href': 'xlinkHref',
  'xml:base': 'xmlBase',
  'xml:lang': 'xmlLang',
  'xml:space': 'xmlSpace',
};

function getComponentName(icon: IconDefinition): string {
  return `${COMPONENT_PREFIX}${icon.key.replace(/_/g, '')}`;
}

export const reactGenerator: Generator = {
  name: 'react',
  generate(icons: IconDefinition[]) {
    const files = icons.map((icon) => ({
      path: resolve(ICONS_DIR, `${getComponentName(icon)}.ts`),
      content: generateIcon(icon),
    }));

    files.push({
      path: PREVIEW_METADATA_PATH,
      content: generatePreviewMetadata(icons),
    });

    return files;
  },
};

function generateIcon(icon: IconDefinition): string {
  const componentName = getComponentName(icon);
  const defaultSize = pickBestSize(icon.sizes);
  const defaultVariant = icon.styles.includes('Regular')
    ? 'Regular'
    : icon.styles[0];
  const sizeType = toTypeUnion(icon.sizes);
  const variantType = toTypeUnion(icon.styles);
  const sourcesBySize = icon.sources.reduce<
    Record<number, Record<string, { viewBox: string; nodes: ReactSvgNode[] }>>
  >((acc, source) => {
    acc[source.size] ??= {};
    acc[source.size][source.style] = {
      viewBox: source.viewBox,
      nodes: source.nodes.map(toReactSvgNode),
    };
    return acc;
  }, {});
  const sourceData = JSON.stringify(sourcesBySize, null, 2);

  return `import {
  createFluentIcon,
  type FluentIconProps,
  type IconSourceMap,
} from '../createFluentIcon.js';

type IconAssetSize = ${sizeType};
type IconVariant = ${variantType};

export type ${componentName}Props = FluentIconProps<IconAssetSize, IconVariant>;

const sources = ${sourceData} satisfies IconSourceMap<IconAssetSize, IconVariant>;

export const ${componentName} = createFluentIcon<IconAssetSize, IconVariant>({
  displayName: ${JSON.stringify(componentName)},
  sources,
  defaultSize: ${defaultSize},
  defaultVariant: ${JSON.stringify(defaultVariant)},
  defaultTitle: ${JSON.stringify(icon.name)},
});

export default ${componentName};
`;
}

function toReactSvgNode(node: SvgNode): ReactSvgNode {
  if (node.type === 'text') {
    return node;
  }

  return {
    type: 'element',
    name: node.name,
    attributes: toReactAttributes(node.attributes),
    children: node.children.map(toReactSvgNode),
  };
}

function toReactAttributes(
  attributes: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(attributes).map(([name, value]) => [
      toReactAttributeName(name),
      value,
    ]),
  );
}

function toReactAttributeName(name: string): string {
  if (name.startsWith('aria-') || name.startsWith('data-')) {
    return name;
  }

  return (
    SVG_ATTRIBUTE_NAMES[name] ??
    name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
  );
}

function generatePreviewMetadata(icons: IconDefinition[]): string {
  const sortedIcons = [...icons].sort((a, b) => naturalCompare(a.key, b.key));
  const metadata = sortedIcons.map((icon) => ({
    key: icon.key,
    name: icon.name,
    sizes: icon.sizes,
    styles: icon.styles,
    keyword: icon.keyword,
    description: icon.description,
    metaphor: icon.metaphor,
    directionType: icon.directionType,
    singleton: icon.singleton,
  }));

  return `${JSON.stringify(metadata)}\n`;
}
