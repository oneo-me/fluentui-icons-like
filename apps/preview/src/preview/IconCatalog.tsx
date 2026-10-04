import { useVirtualizer } from '@tanstack/react-virtual';
import {
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { Button } from '#components/ui/button';
import { cn } from '#lib/utils';
import { LazyIcon } from './LazyIcon';
import type { PreviewIconEntry, PreviewIconStyle } from './registry';

interface IconCatalogProps {
  filtered: PreviewIconEntry[];
  selectedIcon: PreviewIconEntry | null;
  selectedSize: number;
  selectedStyle: PreviewIconStyle;
  scrollRef: RefObject<HTMLDivElement | null>;
  onSelectIcon: (icon: PreviewIconEntry) => void;
}

const gridGap = 6;
const gridPadding = 12;
const minTileSize = 56;
const tileChromePadding = 28;
const iconTileClassName =
  'grid w-full cursor-pointer place-items-center overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-[transform,border-color,background-color,box-shadow] duration-150 ease-out hover:-translate-y-px hover:border-ring/40 hover:bg-card hover:shadow-md [&_svg]:!size-[var(--preview-icon-size)]';
const iconTileActiveClassName =
  'border-ring/60 bg-accent shadow-md ring-2 ring-ring/20 hover:bg-accent';

export function IconCatalog({
  filtered,
  selectedIcon,
  selectedSize,
  selectedStyle,
  scrollRef,
  onSelectIcon,
}: IconCatalogProps) {
  const [scrollWidth, setScrollWidth] = useState(900);
  const displaySize = selectedSize;
  const baseItemSize = Math.max(minTileSize, displaySize + tileChromePadding);
  const gridWidth = Math.max(0, scrollWidth - gridPadding * 2);
  const columnsPerRow = Math.max(
    1,
    Math.floor((gridWidth + gridGap) / (baseItemSize + gridGap)),
  );
  const itemSize = (gridWidth - gridGap * (columnsPerRow - 1)) / columnsPerRow;
  const rowHeight = itemSize + gridGap;
  const totalRows = Math.ceil(filtered.length / columnsPerRow);
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
    <main className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-background">
      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto bg-[var(--preview-background)]">
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
            <div className="absolute top-0 right-3 left-3">
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
                    }}>
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
                            borderRadius: '8px',
                          } as CSSProperties
                        }
                        aria-label={icon.name}
                        aria-pressed={selectedIcon?.key === icon.key}
                        title={icon.description || icon.name}
                        onClick={() => onSelectIcon(icon)}>
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
