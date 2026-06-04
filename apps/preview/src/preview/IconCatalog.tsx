import { useVirtualizer } from '@tanstack/react-virtual';
import {
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Button } from '#components/ui/button';
import { Input } from '#components/ui/input';
import { cn } from '#lib/utils';
import { LazyIcon } from './LazyIcon';
import type { PreviewIconEntry, PreviewIconStyle } from './registry';

interface IconCatalogProps {
  keyword: string;
  leftFilteredCount: number;
  filtered: PreviewIconEntry[];
  selectedIcon: PreviewIconEntry | null;
  selectedSize: number;
  selectedStyle: PreviewIconStyle;
  selectedColor: string;
  effectiveSelectedColor: string;
  colorPickerValue: string;
  selectedScale: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  onKeywordChange: (keyword: string) => void;
  onColorChange: (color: string) => void;
  onSelectScale: (scale: number) => void;
  onSelectIcon: (icon: PreviewIconEntry) => void;
}

const scales = [1, 2, 3];
const gridGap = 6;
const gridPadding = 10;
const minTileSize = 36;
const tileChromePadding = 24;
const textFieldClassName =
  'h-9 w-full min-w-0 rounded-[7px] border border-[var(--preview-border)] bg-[var(--preview-background)] px-2.5 text-[var(--preview-foreground)] shadow-[0_1px_2px_var(--preview-shadow)] outline-none placeholder:text-[var(--preview-muted)] focus-visible:border-[var(--preview-primary)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklab,var(--preview-primary)_18%,transparent)]';
const toolbarControlClassName =
  'min-w-0 cursor-pointer rounded-[7px] border border-[var(--preview-border)] bg-[var(--preview-panel-strong)] text-[11px] font-[740] text-[var(--preview-foreground)] transition-[border-color,background-color,color,box-shadow] duration-150 ease-out hover:border-[color-mix(in_oklab,var(--preview-primary)_48%,var(--preview-border))] hover:bg-[var(--preview-primary-soft)] hover:text-[var(--preview-primary-text)]';
const toolbarControlActiveClassName =
  'border-[color-mix(in_oklab,var(--preview-primary)_62%,var(--preview-border))] bg-[var(--preview-primary-soft)] text-[var(--preview-primary-text)] shadow-[inset_0_1px_0_color-mix(in_oklab,var(--preview-primary)_14%,transparent)]';
const iconTileClassName =
  'grid w-full cursor-pointer place-items-center overflow-hidden border border-[var(--preview-border)] bg-[var(--preview-background)] shadow-[0_1px_2px_var(--preview-shadow)] transition-[transform,border-color,background-color,box-shadow] duration-150 ease-out hover:-translate-y-px hover:border-[color-mix(in_oklab,var(--preview-primary)_48%,var(--preview-border))] hover:bg-[var(--preview-panel-strong)] hover:shadow-[0_6px_18px_var(--preview-shadow)] [&_svg]:!size-[var(--preview-icon-size)]';
const iconTileActiveClassName =
  '-translate-y-px border-[color-mix(in_oklab,var(--preview-primary)_48%,var(--preview-border))] bg-[var(--preview-panel-strong)] shadow-[0_6px_18px_var(--preview-shadow)] [outline:2px_solid_color-mix(in_oklab,var(--preview-primary)_24%,transparent)] outline-offset-[-2px]';

export function IconCatalog({
  keyword,
  leftFilteredCount,
  filtered,
  selectedIcon,
  selectedSize,
  selectedStyle,
  selectedColor,
  effectiveSelectedColor,
  colorPickerValue,
  selectedScale,
  scrollRef,
  onKeywordChange,
  onColorChange,
  onSelectScale,
  onSelectIcon,
}: IconCatalogProps) {
  const [scrollWidth, setScrollWidth] = useState(900);
  const displaySize = selectedSize * selectedScale;
  const baseItemSize = Math.max(minTileSize, displaySize + tileChromePadding);
  const gridWidth = Math.max(0, scrollWidth - gridPadding * 2);
  const columnsPerRow = Math.max(
    1,
    Math.floor((gridWidth + gridGap) / (baseItemSize + gridGap)),
  );
  const itemSize = (gridWidth - gridGap * (columnsPerRow - 1)) / columnsPerRow;
  const rowHeight = itemSize + gridGap;
  const totalRows = Math.ceil(filtered.length / columnsPerRow);
  const iconRadius =
    selectedScale === 3 ? '14px' : selectedScale === 2 ? '10px' : '6px';
  const rowVirtualizer = useVirtualizer({
    count: totalRows,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frame = 0;
    const measure = () => setScrollWidth(el.clientWidth);
    const scheduleMeasure = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };

    measure();
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(el);
    window.addEventListener('resize', scheduleMeasure);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
    };
  }, [scrollRef]);

  const gridTemplateColumns = useMemo(
    () => `repeat(${columnsPerRow}, minmax(0, 1fr))`,
    [columnsPerRow],
  );

  return (
    <main className="flex min-h-0 min-w-0 flex-col bg-[var(--preview-background)]">
      <div className="grid min-h-[54px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 border-b border-[var(--preview-border)] bg-[var(--preview-background)] px-2.5 py-[9px] max-[760px]:grid-cols-1">
        <label className="block w-full min-w-0" htmlFor="icon-search-input">
          <span className="sr-only">Search icons</span>
          <Input
            id="icon-search-input"
            className={textFieldClassName}
            type="search"
            value={keyword}
            placeholder={`Searching metadata from ${leftFilteredCount.toLocaleString()} icons...`}
            onChange={(event) => onKeywordChange(event.currentTarget.value)}
          />
        </label>
        <div className="flex min-w-0 items-center justify-end gap-2 max-[760px]:justify-start">
          <label
            className="grid size-9 flex-none cursor-pointer place-items-center rounded-[7px] border border-[var(--preview-border)] bg-[var(--preview-background)] shadow-[0_1px_2px_var(--preview-shadow)]"
            title="Choose icon color"
          >
            <span className="sr-only">Choose icon color</span>
            <input
              type="color"
              className="size-7 cursor-pointer rounded-[5px] border-0 bg-transparent p-0"
              value={colorPickerValue}
              aria-label="Choose icon color"
              onChange={(event) => onColorChange(event.currentTarget.value)}
            />
          </label>
          <Button
            type="button"
            variant="ghost"
            className={cn(
              toolbarControlClassName,
              'h-9 px-2.5 disabled:pointer-events-auto disabled:cursor-default disabled:opacity-[0.45]',
            )}
            onClick={() => onColorChange('')}
            disabled={selectedColor === ''}
          >
            Reset
          </Button>
          <fieldset className="m-0 grid grid-cols-3 gap-1 border-0 p-0">
            <legend className="sr-only">Icon display scale</legend>
            {scales.map((scale) => (
              <Button
                key={scale}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  toolbarControlClassName,
                  'h-8 w-[34px] px-0',
                  selectedScale === scale && toolbarControlActiveClassName,
                )}
                aria-pressed={selectedScale === scale}
                onClick={() => onSelectScale(scale)}
              >
                {scale}x
              </Button>
            ))}
          </fieldset>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto bg-[var(--preview-background)]"
      >
        {filtered.length === 0 ? (
          <div className="grid min-h-[220px] place-items-center content-center gap-1.5 text-center text-[var(--preview-muted)]">
            <strong className="text-base text-[var(--preview-foreground)]">
              No icons found
            </strong>
            <span>Try another keyword, size, or style.</span>
          </div>
        ) : (
          <>
            <div
              className="pointer-events-none"
              style={{
                height: rowVirtualizer.getTotalSize() + gridPadding * 2,
              }}
            />
            <div className="absolute top-0 right-2.5 left-2.5">
              {virtualRows.map((virtualRow) => {
                const startIndex = virtualRow.index * columnsPerRow;
                const rowIcons = filtered.slice(
                  startIndex,
                  startIndex + columnsPerRow,
                );

                return (
                  <div
                    key={virtualRow.key}
                    className="absolute right-0 left-0 grid content-start gap-1.5 will-change-transform"
                    style={{
                      gridTemplateColumns,
                      transform: `translateY(${virtualRow.start + gridPadding}px)`,
                    }}
                  >
                    {rowIcons.map((icon) => (
                      <Button
                        key={icon.key}
                        type="button"
                        variant="ghost"
                        className={cn(
                          iconTileClassName,
                          selectedIcon?.key === icon.key &&
                            iconTileActiveClassName,
                        )}
                        style={
                          {
                            '--preview-icon-size': `${displaySize}px`,
                            width: itemSize,
                            height: itemSize,
                            aspectRatio: '1 / 1',
                            borderRadius: iconRadius,
                            color: effectiveSelectedColor,
                          } as CSSProperties
                        }
                        title={icon.description || icon.name}
                        onClick={() => onSelectIcon(icon)}
                      >
                        <LazyIcon
                          icon={icon}
                          size={displaySize}
                          variant={selectedStyle}
                        />
                      </Button>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
