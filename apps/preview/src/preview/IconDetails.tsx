import { useEffect, useRef, useState } from 'react';
import { Button } from '#components/ui/button';
import { cn } from '#lib/utils';
import ArrowDownloadIcon from '../../../../packages/react/src/icons/FluentIconArrowDownload';
import CodeIcon from '../../../../packages/react/src/icons/FluentIconCode';
import CopyIcon from '../../../../packages/react/src/icons/FluentIconCopy';
import ImageIcon from '../../../../packages/react/src/icons/FluentIconImage';
import { LazyIcon } from './LazyIcon';
import type { PreviewIconEntry, PreviewIconStyle } from './registry';

interface IconDetailsProps {
  selectedIcon: PreviewIconEntry | null;
  selectedSize: number;
  selectedStyle: PreviewIconStyle;
  selectedColor: string;
}

type SnippetId =
  | 'react-install'
  | 'react-import'
  | 'react'
  | 'svelte-install'
  | 'svelte-import'
  | 'svelte'
  | 'avalonia-install'
  | 'avalonia-reference'
  | 'avalonia';
type PackageTabId = 'react' | 'svelte' | 'avalonia';

const reactDefaultSize = 20;
const reactDefaultStyle = 'Regular';
const svelteDefaultSize = 20;
const svelteDefaultStyle = 'Regular';
const avaloniaDefaultSize = 24;
const avaloniaDefaultStyle = 'Regular';
const packageVersion = '2.1.0-preview.0';
const packageTabStorageKey = 'fluentui-icons-like:active-package-tab';
const detailPanelClassName =
  'relative min-h-0 min-w-0 overflow-hidden border-l border-[var(--preview-border)] bg-[var(--preview-background)] text-[var(--preview-foreground)] max-[980px]:hidden';
const detailScrollClassName = 'h-full overflow-y-auto';
const emptyStateClassName =
  'grid min-h-[220px] place-items-center content-center gap-1.5 text-center text-[var(--preview-muted)]';
const detailLabelClassName =
  'text-[11px] font-[780] tracking-[0.08em] text-[var(--preview-muted)] uppercase';
const detailValueClassName =
  'm-0 min-w-0 text-xs leading-[1.45] [overflow-wrap:anywhere]';
const detailRowClassName =
  'grid gap-1.5 border-b border-[color-mix(in_oklab,var(--preview-border)_58%,transparent)] py-2 last:border-b-0';
const copyStateClassName =
  'bg-[color-mix(in_oklab,var(--preview-primary)_14%,var(--preview-panel))] text-[var(--preview-primary-text)]';
const previewActionButtonClassName =
  'h-[38px] min-w-0 cursor-pointer rounded-none border-0 border-r border-[var(--preview-border)] bg-transparent text-[11px] font-[760] transition-colors duration-150 ease-out last:border-r-0 hover:bg-[var(--preview-primary-soft)] hover:text-[var(--preview-primary-text)]';
const copyButtonClassName =
  'inline-grid size-7 flex-none cursor-pointer place-items-center rounded-[7px] border-0 bg-transparent transition-[background-color,color,box-shadow] duration-150 ease-out hover:bg-[var(--preview-primary-soft)] hover:text-[var(--preview-primary-text)]';
const previewGridClassName =
  'grid aspect-square w-full place-items-center bg-[var(--preview-background)] [background-image:linear-gradient(90deg,color-mix(in_oklab,var(--preview-primary)_10%,transparent)_1px,transparent_1px),linear-gradient(color-mix(in_oklab,var(--preview-primary)_10%,transparent)_1px,transparent_1px)] [background-position:4px_4px] [background-size:16px_16px]';
const packageTabClassName =
  'h-8 min-w-0 rounded-[7px] border border-transparent px-2 text-[11px] font-[740] text-[var(--preview-muted)] transition-[border-color,background-color,color,box-shadow] duration-150 ease-out hover:bg-[var(--preview-primary-soft)] hover:text-[var(--preview-primary-text)]';
const packageTabActiveClassName =
  'border-[color-mix(in_oklab,var(--preview-primary)_54%,var(--preview-border))] bg-[var(--preview-primary-soft)] text-[var(--preview-primary-text)] shadow-[inset_0_1px_0_color-mix(in_oklab,var(--preview-primary)_12%,transparent)]';
const packageTabs: Array<{
  id: PackageTabId;
  label: string;
}> = [
  {
    id: 'react',
    label: 'React',
  },
  {
    id: 'svelte',
    label: 'Svelte',
  },
  {
    id: 'avalonia',
    label: 'Avalonia',
  },
];

export function IconDetails({
  selectedIcon,
  selectedSize,
  selectedStyle,
  selectedColor,
}: IconDetailsProps) {
  const sourcePreviewRef = useRef<HTMLDivElement | null>(null);
  const [copiedName, setCopiedName] = useState('');
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<SnippetId | ''>('');
  const [activePackage, setActivePackage] =
    useState<PackageTabId>(getStoredPackageTab);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    setStoredPackageTab(activePackage);
  }, [activePackage]);

  if (!selectedIcon) {
    return (
      <aside
        className={detailPanelClassName}
        aria-label="Selected icon details"
      >
        <div className={detailScrollClassName}>
          <div className={emptyStateClassName}>
            <strong className="text-base text-[var(--preview-foreground)]">
              Select an icon
            </strong>
            <span>Details appear here.</span>
          </div>
        </div>
      </aside>
    );
  }

  const icon = selectedIcon;
  const componentName = `FluentIcon${icon.key.replace(/_/g, '')}`;
  const avaloniaSymbol = icon.key.replace(/_/g, '');
  const reactInstallSnippet = `pnpm add @oneo/fluentui-icons-like-react@${packageVersion}`;
  const reactImportSnippet = `import ${componentName} from '@oneo/fluentui-icons-like-react/${componentName}';`;
  const reactIconSnippet = buildReactIconSnippet(
    componentName,
    selectedSize,
    selectedStyle,
  );
  const svelteInstallSnippet = `pnpm add @oneo/fluentui-icons-like@${packageVersion}`;
  const svelteImportSnippet = `import ${componentName} from '@oneo/fluentui-icons-like/${componentName}.svelte';`;
  const svelteIconSnippet = buildSvelteIconSnippet(
    componentName,
    selectedSize,
    selectedStyle,
  );
  const avaloniaInstallSnippet = [
    `dotnet add package ONEO.FluentUIIconsLike --version ${packageVersion}`,
    `dotnet add package ONEO.FluentUIIconsLike.Generator --version ${packageVersion}`,
  ].join('\n');
  const avaloniaReferenceSnippet =
    buildAvaloniaReferenceSnippet(avaloniaSymbol);
  const avaloniaIconSnippet = buildAvaloniaIconSnippet(
    avaloniaSymbol,
    selectedSize,
    selectedStyle,
  );

  function markCopied(kind: 'name' | 'svg' | SnippetId, value = '') {
    setPulse((current) => current + 1);
    if (kind === 'name') {
      setCopiedName(value);
      window.setTimeout(() => setCopiedName(''), 420);
      return;
    }
    if (kind === 'svg') {
      setCopiedSvg(true);
      window.setTimeout(() => setCopiedSvg(false), 420);
      return;
    }
    setCopiedSnippet(kind);
    window.setTimeout(() => setCopiedSnippet(''), 420);
  }

  function copyText(text: string, kind: 'name' | SnippetId, value = text) {
    if (!text) return;
    markCopied(kind, value);
    void navigator.clipboard.writeText(text).catch(() => undefined);
  }

  function getFilename(extension: 'svg' | 'png') {
    return `${icon.key}_${selectedSize}_${selectedStyle.toLowerCase()}.${extension}`;
  }

  function getSvgCode() {
    const svg = sourcePreviewRef.current?.querySelector('svg');
    if (!svg) return '';

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(selectedSize));
    clone.setAttribute('height', String(selectedSize));
    clone.setAttribute('color', selectedColor);
    clone.style.cssText = `color: ${selectedColor}`;

    return new XMLSerializer().serializeToString(clone);
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  function downloadSvg() {
    const svgCode = getSvgCode();
    if (!svgCode) return;
    downloadBlob(
      new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' }),
      getFilename('svg'),
    );
  }

  async function downloadPng() {
    const svgCode = getSvgCode();
    if (!svgCode) return;

    const exportSize = Math.max(256, selectedSize * 8);
    const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const image = new Image();

    try {
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error('Unable to render icon image'));
        image.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = exportSize;
      canvas.height = exportSize;
      const context = canvas.getContext('2d');
      if (!context) return;

      context.clearRect(0, 0, exportSize, exportSize);
      context.drawImage(image, 0, 0, exportSize, exportSize);
      canvas.toBlob((pngBlob) => {
        if (pngBlob) downloadBlob(pngBlob, getFilename('png'));
      }, 'image/png');
    } catch {
      return;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function copySvgCode() {
    const svgCode = getSvgCode();
    if (!svgCode) return;
    markCopied('svg');
    void navigator.clipboard.writeText(svgCode).catch(() => undefined);
  }

  return (
    <aside className={detailPanelClassName} aria-label="Selected icon details">
      <div className={detailScrollClassName}>
        <div
          className="grid overflow-hidden border-b border-[var(--preview-border)] bg-[var(--preview-panel-strong)]"
          style={{ color: selectedColor }}
        >
          <div className={previewGridClassName}>
            <LazyIcon
              icon={icon}
              size={120}
              variant={selectedStyle}
              title={icon.name}
            />
          </div>
          <div className="grid grid-cols-3 border-t border-[var(--preview-border)]">
            <Button
              type="button"
              variant="ghost"
              className={previewActionButtonClassName}
              aria-label="Download SVG"
              onClick={downloadSvg}
            >
              <ArrowDownloadIcon
                size={16}
                variant={selectedStyle}
                title={null}
              />
              <span>SVG</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={previewActionButtonClassName}
              aria-label="Download PNG"
              onClick={downloadPng}
            >
              <ImageIcon size={16} variant={selectedStyle} title={null} />
              <span>PNG</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                previewActionButtonClassName,
                copiedAnimationClass(copiedSvg, pulse),
              )}
              data-copied={copiedSvg}
              data-copy-pulse={pulse % 2 === 0 ? 'even' : 'odd'}
              aria-label="Copy SVG code"
              title={copiedSvg ? 'Copied' : 'Copy SVG code'}
              onClick={copySvgCode}
            >
              {copiedSvg ? (
                <CopyIcon size={16} variant={selectedStyle} title={null} />
              ) : (
                <CodeIcon size={16} variant={selectedStyle} title={null} />
              )}
              <span>Code</span>
            </Button>
          </div>
        </div>

        <div
          className="pointer-events-none absolute size-0 overflow-hidden opacity-0"
          aria-hidden="true"
          ref={sourcePreviewRef}
          style={{ color: selectedColor }}
        >
          <LazyIcon
            icon={icon}
            size={selectedSize}
            variant={selectedStyle}
            title={icon.name}
          />
        </div>

        <div className="grid gap-2 border-b border-[var(--preview-border)] px-2.5 py-2.5">
          <div
            className="grid grid-cols-3 gap-1"
            role="tablist"
            aria-label="Package usage"
          >
            {packageTabs.map((tab) => (
              <Button
                key={tab.id}
                type="button"
                variant="ghost"
                role="tab"
                id={`${tab.id}-usage-tab`}
                aria-selected={activePackage === tab.id}
                aria-controls={`${tab.id}-usage-panel`}
                className={cn(
                  packageTabClassName,
                  activePackage === tab.id && packageTabActiveClassName,
                )}
                onClick={() => setActivePackage(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>

          <PackageUsagePanel
            activePackage={activePackage}
            reactInstallSnippet={reactInstallSnippet}
            reactImportSnippet={reactImportSnippet}
            reactIconSnippet={reactIconSnippet}
            svelteInstallSnippet={svelteInstallSnippet}
            svelteImportSnippet={svelteImportSnippet}
            svelteIconSnippet={svelteIconSnippet}
            avaloniaInstallSnippet={avaloniaInstallSnippet}
            avaloniaReferenceSnippet={avaloniaReferenceSnippet}
            avaloniaIconSnippet={avaloniaIconSnippet}
            copiedSnippet={copiedSnippet}
            pulse={pulse}
            onCopy={copyText}
          />
        </div>

        <dl className="m-0 grid px-2.5 pb-3">
          <DetailValue
            label="Name"
            value={icon.name}
            copied={copiedName === icon.name}
            pulse={pulse}
            onCopy={() => copyText(icon.name, 'name')}
          />
          <TextRow
            label="Description"
            value={icon.description || 'No description'}
          />
          <TagRow label="Keyword" tags={splitKeywords(icon.keyword)} />
          <TagRow label="Metaphors" tags={icon.metaphor} />
          <TagRow label="Styles" tags={icon.styles} />
          <TagRow label="Sizes" tags={icon.sizes.map((size) => `${size}px`)} />
        </dl>
      </div>
    </aside>
  );
}

function buildReactIconSnippet(
  componentName: string,
  selectedSize: number,
  selectedStyle: PreviewIconStyle,
) {
  const attrs: string[] = [];
  if (selectedSize !== reactDefaultSize) attrs.push(`size={${selectedSize}}`);
  if (selectedStyle !== reactDefaultStyle)
    attrs.push(`variant="${selectedStyle}"`);
  return `<${componentName}${attrs.length ? ` ${attrs.join(' ')}` : ''} />`;
}

function buildSvelteIconSnippet(
  componentName: string,
  selectedSize: number,
  selectedStyle: PreviewIconStyle,
) {
  const attrs: string[] = [];
  if (selectedSize !== svelteDefaultSize) attrs.push(`size={${selectedSize}}`);
  if (selectedStyle !== svelteDefaultStyle)
    attrs.push(`style="${selectedStyle}"`);
  return `<${componentName}${attrs.length ? ` ${attrs.join(' ')}` : ''} />`;
}

function buildAvaloniaIconSnippet(
  avaloniaSymbol: string,
  selectedSize: number,
  selectedStyle: PreviewIconStyle,
) {
  const attrs = [`Symbol="${avaloniaSymbol}"`];
  if (selectedSize !== avaloniaDefaultSize)
    attrs.push(`Size="Size${selectedSize}"`);
  if (selectedStyle !== avaloniaDefaultStyle)
    attrs.push(`Style="${selectedStyle}"`);
  return `<icons:FluentIcon ${attrs.join(' ')} />`;
}

function buildAvaloniaReferenceSnippet(avaloniaSymbol: string) {
  return [
    'using FluentUIIconsLike;',
    '',
    `[assembly: FluentIconReferences(FluentIconSymbol.${avaloniaSymbol})]`,
  ].join('\n');
}

function splitKeywords(keyword: string) {
  return keyword
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

function getStoredPackageTab(): PackageTabId {
  if (typeof window === 'undefined') return 'react';

  try {
    const storedTab = window.localStorage.getItem(packageTabStorageKey);
    return isPackageTabId(storedTab) ? storedTab : 'react';
  } catch {
    return 'react';
  }
}

function setStoredPackageTab(tab: PackageTabId) {
  try {
    window.localStorage.setItem(packageTabStorageKey, tab);
  } catch {
    return;
  }
}

function isPackageTabId(value: string | null): value is PackageTabId {
  return value === 'react' || value === 'svelte' || value === 'avalonia';
}

function PackageUsagePanel({
  activePackage,
  reactInstallSnippet,
  reactImportSnippet,
  reactIconSnippet,
  svelteInstallSnippet,
  svelteImportSnippet,
  svelteIconSnippet,
  avaloniaInstallSnippet,
  avaloniaReferenceSnippet,
  avaloniaIconSnippet,
  copiedSnippet,
  pulse,
  onCopy,
}: {
  activePackage: PackageTabId;
  reactInstallSnippet: string;
  reactImportSnippet: string;
  reactIconSnippet: string;
  svelteInstallSnippet: string;
  svelteImportSnippet: string;
  svelteIconSnippet: string;
  avaloniaInstallSnippet: string;
  avaloniaReferenceSnippet: string;
  avaloniaIconSnippet: string;
  copiedSnippet: SnippetId | '';
  pulse: number;
  onCopy: (text: string, kind: SnippetId, value?: string) => void;
}) {
  return (
    <section
      role="tabpanel"
      id={`${activePackage}-usage-panel`}
      aria-labelledby={`${activePackage}-usage-tab`}
      className="grid gap-2"
    >
      <dl className="m-0 grid">
        {activePackage === 'react' ? (
          <>
            <SnippetRow
              label="Install"
              snippet={reactInstallSnippet}
              copied={copiedSnippet === 'react-install'}
              pulse={pulse}
              onCopy={() => onCopy(reactInstallSnippet, 'react-install')}
            />
            <SnippetRow
              label="Import"
              snippet={reactImportSnippet}
              copied={copiedSnippet === 'react-import'}
              pulse={pulse}
              onCopy={() => onCopy(reactImportSnippet, 'react-import')}
            />
            <SnippetRow
              label="Use"
              snippet={reactIconSnippet}
              copied={copiedSnippet === 'react'}
              pulse={pulse}
              onCopy={() => onCopy(reactIconSnippet, 'react')}
            />
          </>
        ) : null}

        {activePackage === 'svelte' ? (
          <>
            <SnippetRow
              label="Install"
              snippet={svelteInstallSnippet}
              copied={copiedSnippet === 'svelte-install'}
              pulse={pulse}
              onCopy={() => onCopy(svelteInstallSnippet, 'svelte-install')}
            />
            <SnippetRow
              label="Import"
              snippet={svelteImportSnippet}
              copied={copiedSnippet === 'svelte-import'}
              pulse={pulse}
              onCopy={() => onCopy(svelteImportSnippet, 'svelte-import')}
            />
            <SnippetRow
              label="Use"
              snippet={svelteIconSnippet}
              copied={copiedSnippet === 'svelte'}
              pulse={pulse}
              onCopy={() => onCopy(svelteIconSnippet, 'svelte')}
            />
          </>
        ) : null}

        {activePackage === 'avalonia' ? (
          <>
            <SnippetRow
              label="Install"
              snippet={avaloniaInstallSnippet}
              copied={copiedSnippet === 'avalonia-install'}
              pulse={pulse}
              onCopy={() => onCopy(avaloniaInstallSnippet, 'avalonia-install')}
            />
            <SnippetRow
              label="Reference"
              snippet={avaloniaReferenceSnippet}
              copied={copiedSnippet === 'avalonia-reference'}
              pulse={pulse}
              onCopy={() =>
                onCopy(avaloniaReferenceSnippet, 'avalonia-reference')
              }
            />
            <SnippetRow
              label="Use"
              snippet={avaloniaIconSnippet}
              copied={copiedSnippet === 'avalonia'}
              pulse={pulse}
              onCopy={() => onCopy(avaloniaIconSnippet, 'avalonia')}
            />
          </>
        ) : null}
      </dl>
    </section>
  );
}

function DetailValue({
  label,
  value,
  copied,
  pulse,
  onCopy,
}: {
  label: string;
  value: string;
  copied: boolean;
  pulse: number;
  onCopy: () => void;
}) {
  return (
    <div className={detailRowClassName}>
      <dt className={detailLabelClassName}>{label}</dt>
      <dd
        className={cn(
          detailValueClassName,
          'flex items-start justify-between gap-2',
        )}
      >
        <span>{value}</span>
        <CopyButton
          copied={copied}
          pulse={pulse}
          onClick={onCopy}
          label={`Copy ${label}`}
        />
      </dd>
    </div>
  );
}

function SnippetRow({
  label,
  snippet,
  copied,
  pulse,
  onCopy,
}: {
  label: string;
  snippet: string;
  copied: boolean;
  pulse: number;
  onCopy: () => void;
}) {
  return (
    <div className={detailRowClassName}>
      <dt className={detailLabelClassName}>{label}</dt>
      <dd
        className={cn(
          detailValueClassName,
          'flex items-start justify-between gap-2',
        )}
      >
        <code className="min-w-0 flex-1 rounded-md border border-[color-mix(in_oklab,var(--preview-border)_72%,transparent)] bg-[color-mix(in_oklab,var(--preview-panel-strong)_72%,var(--preview-background))] px-[7px] py-1.5 font-mono text-[11px] leading-[1.55] whitespace-pre-wrap [overflow-wrap:anywhere]">
          {snippet}
        </code>
        <CopyButton
          copied={copied}
          pulse={pulse}
          onClick={onCopy}
          label={`Copy ${label}`}
        />
      </dd>
    </div>
  );
}

function TextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={detailRowClassName}>
      <dt className={detailLabelClassName}>{label}</dt>
      <dd className={detailValueClassName}>{value}</dd>
    </div>
  );
}

function TagRow({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div className={detailRowClassName}>
      <dt className={detailLabelClassName}>{label}</dt>
      <dd className={cn(detailValueClassName, 'flex flex-wrap gap-[5px]')}>
        {tags.map((tag) => (
          <span
            key={tag}
            className="max-w-full overflow-hidden rounded-full border border-[var(--preview-border)] bg-[color-mix(in_oklab,var(--preview-panel-strong)_68%,var(--preview-background))] px-[7px] py-[3px] text-[10px] text-ellipsis whitespace-nowrap text-[var(--preview-foreground)]"
          >
            {tag}
          </span>
        ))}
      </dd>
    </div>
  );
}

function CopyButton({
  copied,
  pulse,
  label,
  onClick,
}: {
  copied: boolean;
  pulse: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(copyButtonClassName, copiedAnimationClass(copied, pulse))}
      data-copied={copied}
      data-copy-pulse={pulse % 2 === 0 ? 'even' : 'odd'}
      aria-label={label}
      title={copied ? 'Copied' : label}
      onClick={onClick}
    >
      <CopyIcon size={16} title={null} />
    </Button>
  );
}

function copiedAnimationClass(copied: boolean, pulse: number) {
  if (!copied) return '';
  return cn(
    copyStateClassName,
    pulse % 2 === 0
      ? 'motion-safe:animate-[copy-pop-even_420ms_ease-out]'
      : 'motion-safe:animate-[copy-pop-odd_420ms_ease-out]',
  );
}
