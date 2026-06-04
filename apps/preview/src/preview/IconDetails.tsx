import { useRef, useState } from 'react';
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
  | 'react-import'
  | 'react'
  | 'svelte-import'
  | 'svelte'
  | 'avalonia';

const reactDefaultSize = 20;
const reactDefaultStyle = 'Regular';
const svelteDefaultSize = 20;
const svelteDefaultStyle = 'Regular';
const avaloniaDefaultSize = 24;
const avaloniaDefaultStyle = 'Regular';

export function IconDetails({
  selectedIcon,
  selectedSize,
  selectedStyle,
  selectedColor,
}: IconDetailsProps) {
  const sourcePreviewRef = useRef<HTMLDivElement | null>(null);
  const [copiedKey, setCopiedKey] = useState('');
  const [copiedName, setCopiedName] = useState('');
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<SnippetId | ''>('');
  const [pulse, setPulse] = useState(0);

  if (!selectedIcon) {
    return (
      <aside className="detail-panel" aria-label="Selected icon details">
        <div className="empty-state">
          <strong>Select an icon</strong>
          <span>Details appear here.</span>
        </div>
      </aside>
    );
  }

  const icon = selectedIcon;
  const componentName = `FluentIcon${icon.key.replace(/_/g, '')}`;
  const avaloniaSymbol = icon.key.replace(/_/g, '');
  const avaloniaSymbolKey = `FluentIconSymbol.${avaloniaSymbol}`;
  const reactImportSnippet = `import ${componentName} from '@oneo/fluentui-icons-like-react/${componentName}';`;
  const reactIconSnippet = buildReactIconSnippet(
    componentName,
    selectedSize,
    selectedStyle,
  );
  const svelteImportSnippet = `import ${componentName} from '@oneo/fluentui-icons-like/${componentName}.svelte';`;
  const svelteIconSnippet = buildSvelteIconSnippet(
    componentName,
    selectedSize,
    selectedStyle,
  );
  const avaloniaIconSnippet = buildAvaloniaIconSnippet(
    avaloniaSymbol,
    selectedSize,
    selectedStyle,
  );

  function markCopied(kind: 'key' | 'name' | 'svg' | SnippetId, value = '') {
    setPulse((current) => current + 1);
    if (kind === 'key') {
      setCopiedKey(value);
      window.setTimeout(() => setCopiedKey(''), 420);
      return;
    }
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

  function copyText(
    text: string,
    kind: 'key' | 'name' | SnippetId,
    value = text,
  ) {
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
    <aside className="detail-panel" aria-label="Selected icon details">
      <div className="detail-preview" style={{ color: selectedColor }}>
        <div className="preview-grid">
          <LazyIcon
            icon={icon}
            size={120}
            variant={selectedStyle}
            title={icon.name}
          />
        </div>
        <div className="preview-actions">
          <button type="button" aria-label="Download SVG" onClick={downloadSvg}>
            <ArrowDownloadIcon size={16} variant={selectedStyle} title={null} />
            <span>SVG</span>
          </button>
          <button type="button" aria-label="Download PNG" onClick={downloadPng}>
            <ImageIcon size={16} variant={selectedStyle} title={null} />
            <span>PNG</span>
          </button>
          <button
            type="button"
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
          </button>
        </div>
      </div>

      <div
        className="source-preview"
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

      <dl className="detail-list">
        <DetailValue
          label="Name"
          value={icon.name}
          copied={copiedName === icon.name}
          pulse={pulse}
          onCopy={() => copyText(icon.name, 'name')}
        />
        <SnippetRow
          label="React import"
          snippet={reactImportSnippet}
          copied={copiedSnippet === 'react-import'}
          pulse={pulse}
          onCopy={() => copyText(reactImportSnippet, 'react-import')}
        />
        <SnippetRow
          label="React"
          snippet={reactIconSnippet}
          copied={copiedSnippet === 'react'}
          pulse={pulse}
          onCopy={() => copyText(reactIconSnippet, 'react')}
        />
        <SnippetRow
          label="Svelte import"
          snippet={svelteImportSnippet}
          copied={copiedSnippet === 'svelte-import'}
          pulse={pulse}
          onCopy={() => copyText(svelteImportSnippet, 'svelte-import')}
        />
        <SnippetRow
          label="Svelte"
          snippet={svelteIconSnippet}
          copied={copiedSnippet === 'svelte'}
          pulse={pulse}
          onCopy={() => copyText(svelteIconSnippet, 'svelte')}
        />
        <SnippetRow
          label="Avalonia key"
          snippet={avaloniaSymbolKey}
          copied={copiedKey === avaloniaSymbolKey}
          pulse={pulse}
          onCopy={() => copyText(avaloniaSymbolKey, 'key')}
        />
        <SnippetRow
          label="Avalonia"
          snippet={avaloniaIconSnippet}
          copied={copiedSnippet === 'avalonia'}
          pulse={pulse}
          onCopy={() => copyText(avaloniaIconSnippet, 'avalonia')}
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

function splitKeywords(keyword: string) {
  return keyword
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
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
    <div className="detail-row">
      <dt>{label}</dt>
      <dd className="copy-row">
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
    <div className="detail-row">
      <dt>{label}</dt>
      <dd className="snippet-row">
        <code>{snippet}</code>
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
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function TagRow({ label, tags }: { label: string; tags: string[] }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd className="tag-list">
        {tags.map((tag) => (
          <span key={tag} className="tag">
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
    <button
      type="button"
      className="copy-button"
      data-copied={copied}
      data-copy-pulse={pulse % 2 === 0 ? 'even' : 'odd'}
      aria-label={label}
      title={copied ? 'Copied' : label}
      onClick={onClick}
    >
      <CopyIcon size={16} title={null} />
    </button>
  );
}
