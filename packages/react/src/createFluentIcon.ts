import * as React from 'react';

export type IconSvgNode = IconSvgElementNode | IconSvgTextNode;

export interface IconSvgElementNode {
  type: 'element';
  name: string;
  attributes: Record<string, string | undefined>;
  children: IconSvgNode[];
}

export interface IconSvgTextNode {
  type: 'text';
  value: string;
}

export interface IconSourceData {
  viewBox: string;
  nodes: IconSvgNode[];
}

export type IconSourceMap<
  TSize extends number = number,
  TVariant extends string = string,
> = Partial<Record<TSize, Partial<Record<TVariant, IconSourceData>>>>;

export type FluentIconProps<
  TSize extends number = number,
  TVariant extends string = string,
> = Omit<React.SVGAttributes<SVGSVGElement>, 'title'> & {
  size?: TSize | number;
  variant?: TVariant | string;
  title?: string | null;
};

export type FluentIconComponent<
  TSize extends number = number,
  TVariant extends string = string,
> = React.ForwardRefExoticComponent<
  FluentIconProps<TSize, TVariant> & React.RefAttributes<SVGSVGElement>
>;

interface CreateFluentIconOptions<
  TSize extends number,
  TVariant extends string,
> {
  displayName: string;
  sources: IconSourceMap<TSize, TVariant>;
  defaultSize: TSize;
  defaultVariant: TVariant;
  defaultTitle: string;
}

export function createFluentIcon<
  TSize extends number,
  TVariant extends string,
>({
  displayName,
  sources,
  defaultSize,
  defaultVariant,
  defaultTitle,
}: CreateFluentIconOptions<TSize, TVariant>): FluentIconComponent<
  TSize,
  TVariant
> {
  const Icon = React.forwardRef<
    SVGSVGElement,
    FluentIconProps<TSize, TVariant>
  >(
    (
      {
        size = defaultSize,
        variant = defaultVariant,
        title = defaultTitle,
        ...others
      },
      ref,
    ) => {
      const source =
        sources[size as TSize]?.[variant as TVariant] ??
        sources[defaultSize]?.[variant as TVariant] ??
        sources[size as TSize]?.[defaultVariant] ??
        sources[defaultSize]?.[defaultVariant];

      if (!source) {
        return null;
      }

      return React.createElement(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: source.viewBox,
          width: size,
          height: size,
          ...others,
          ref,
        },
        title ? React.createElement('title', { key: 'title' }, title) : null,
        ...source.nodes.map((node, index) => renderSvgNode(node, `${index}`)),
      );
    },
  );

  Icon.displayName = displayName;
  return Icon;
}

function renderSvgNode(node: IconSvgNode, key: string): React.ReactNode {
  if (node.type === 'text') {
    return node.value;
  }

  return React.createElement(
    node.name,
    { ...node.attributes, key },
    ...node.children.map((child, index) =>
      renderSvgNode(child, `${key}-${index}`),
    ),
  );
}
