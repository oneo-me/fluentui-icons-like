import type { RefObject } from 'react';
import { LazyIcon } from './LazyIcon';
import type { PreviewIconEntry, PreviewIconStyle } from './registry';

interface IconCatalogProps {
  keyword: string;
  leftFilteredCount: number;
  filtered: PreviewIconEntry[];
  visibleIcons: PreviewIconEntry[];
  selectedIcon: PreviewIconEntry | null;
  selectedSize: number;
  selectedStyle: PreviewIconStyle;
  selectedColor: string;
  effectiveSelectedColor: string;
  colorPickerValue: string;
  selectedScale: number;
  gridRef: RefObject<HTMLDivElement | null>;
  totalRows: number;
  rowHeight: number;
  padding: number;
  columnsPerRow: number;
  itemsTop: number;
  itemSize: number;
  onKeywordChange: (keyword: string) => void;
  onColorChange: (color: string) => void;
  onScroll: () => void;
  onSelectScale: (scale: number) => void;
  onSelectIcon: (icon: PreviewIconEntry) => void;
}

const scales = [1, 2, 3];

export function IconCatalog({
  keyword,
  leftFilteredCount,
  filtered,
  visibleIcons,
  selectedIcon,
  selectedSize,
  selectedStyle,
  selectedColor,
  effectiveSelectedColor,
  colorPickerValue,
  selectedScale,
  gridRef,
  totalRows,
  rowHeight,
  padding,
  columnsPerRow,
  itemsTop,
  itemSize,
  onKeywordChange,
  onColorChange,
  onScroll,
  onSelectScale,
  onSelectIcon,
}: IconCatalogProps) {
  const iconRadius =
    selectedScale === 3 ? '14px' : selectedScale === 2 ? '10px' : '6px';

  return (
    <main className="catalog-panel">
      <div className="catalog-toolbar">
        <label className="field-label search-label">
          <span className="sr-only">Search icons</span>
          <input
            className="text-field"
            type="search"
            value={keyword}
            placeholder={`Searching metadata from ${leftFilteredCount.toLocaleString()} icons...`}
            onChange={(event) => onKeywordChange(event.currentTarget.value)}
          />
        </label>
        <div className="toolbar-actions">
          <label className="color-control" title="Choose icon color">
            <span className="sr-only">Choose icon color</span>
            <input
              type="color"
              value={colorPickerValue}
              aria-label="Choose icon color"
              onChange={(event) => onColorChange(event.currentTarget.value)}
            />
          </label>
          <button
            type="button"
            className="ghost-control"
            onClick={() => onColorChange('')}
            disabled={selectedColor === ''}
          >
            Reset
          </button>
          <fieldset className="segmented">
            <legend className="sr-only">Icon display scale</legend>
            {scales.map((scale) => (
              <button
                key={scale}
                type="button"
                aria-pressed={selectedScale === scale}
                onClick={() => onSelectScale(scale)}
              >
                {scale}x
              </button>
            ))}
          </fieldset>
        </div>
      </div>

      <div className="virtual-grid" ref={gridRef} onScroll={onScroll}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <strong>No icons found</strong>
            <span>Try another keyword, size, or style.</span>
          </div>
        ) : (
          <>
            <div
              className="virtual-spacer"
              style={{ height: totalRows * rowHeight + padding * 2 }}
            />
            <div
              className="virtual-content"
              style={{
                gridTemplateColumns: `repeat(${columnsPerRow}, minmax(0, 1fr))`,
                transform: `translateY(${itemsTop + padding}px)`,
              }}
            >
              {visibleIcons.map((icon) => (
                <button
                  key={icon.key}
                  type="button"
                  className={
                    selectedIcon?.key === icon.key
                      ? 'icon-tile active'
                      : 'icon-tile'
                  }
                  style={{
                    width: itemSize,
                    height: itemSize,
                    aspectRatio: '1 / 1',
                    borderRadius: iconRadius,
                    color: effectiveSelectedColor,
                  }}
                  title={icon.description || icon.name}
                  onClick={() => onSelectIcon(icon)}
                >
                  <LazyIcon
                    icon={icon}
                    size={selectedSize * selectedScale}
                    variant={selectedStyle}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
