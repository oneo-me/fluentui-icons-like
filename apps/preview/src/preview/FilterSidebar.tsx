import type { ReactNode } from 'react';
import { Button } from '#components/ui/button';
import { Input } from '#components/ui/input';
import { cn } from '#lib/utils';
import type { PreviewIconStyle } from './registry';

interface FilterSidebarProps {
  totalIconCount: number;
  allSizes: number[];
  allStyles: PreviewIconStyle[];
  visibleMetaphors: string[];
  selectedSize: number;
  selectedStyle: PreviewIconStyle;
  selectedMetaphor: string;
  metaphorKeyword: string;
  onMetaphorKeywordChange: (value: string) => void;
  onSelectSize: (size: number) => void;
  onSelectStyle: (style: PreviewIconStyle) => void;
  onSelectMetaphor: (metaphor: string) => void;
}

const sidebarClassName =
  'flex min-h-0 min-w-0 max-w-full flex-col gap-3 overflow-hidden border-r border-border p-3 max-[760px]:max-h-[36vh] max-[760px]:border-r-0 max-[760px]:border-b max-[760px]:gap-3';
const sectionHeadingClassName =
  'text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase';
const fieldLabelClassName = 'block min-w-0';
const textFieldClassName = 'h-9';
const chipBaseClassName =
  'h-8 w-full min-w-0 cursor-pointer truncate px-2 text-xs';
const chipActiveClassName =
  'border-ring/50 bg-accent text-accent-foreground shadow-sm hover:bg-accent';
const metaphorChipClassName =
  'h-7 w-auto max-w-full min-w-0 shrink justify-start truncate px-2';

export function FilterSidebar({
  totalIconCount,
  allSizes,
  allStyles,
  visibleMetaphors,
  selectedSize,
  selectedStyle,
  selectedMetaphor,
  metaphorKeyword,
  onMetaphorKeywordChange,
  onSelectSize,
  onSelectStyle,
  onSelectMetaphor,
}: FilterSidebarProps) {
  return (
    <aside className={sidebarClassName} aria-label="Icon filters">
      <FilterSection title="Size">
        <div className="grid grid-cols-4 gap-[5px]">
          {allSizes.map((size) => (
            <Button
              key={size}
              type="button"
              variant="outline"
              size="xs"
              className={chipClass(selectedSize === size)}
              aria-pressed={selectedSize === size}
              onClick={() => onSelectSize(size)}>
              {size}
            </Button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Style">
        <div className="grid grid-cols-3 gap-[5px]">
          {allStyles.map((style) => (
            <Button
              key={style}
              type="button"
              variant="outline"
              size="sm"
              className={chipClass(selectedStyle === style)}
              aria-pressed={selectedStyle === style}
              onClick={() => onSelectStyle(style)}>
              {style}
            </Button>
          ))}
        </div>
      </FilterSection>

      <section className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_auto_minmax(0,1fr)] gap-2 py-1">
        <div className={sectionHeadingClassName}>Metaphors</div>
        <label className={fieldLabelClassName} htmlFor="metaphor-filter-input">
          <span className="sr-only">Filter metaphors</span>
          <Input
            id="metaphor-filter-input"
            className={textFieldClassName}
            type="search"
            value={metaphorKeyword}
            placeholder="Filter metaphors"
            onChange={(event) =>
              onMetaphorKeywordChange(event.currentTarget.value)
            }
          />
        </label>
        <div className="min-h-0 min-w-0 overflow-y-auto pr-1">
          <div className="flex min-w-0 max-w-full flex-wrap content-start gap-[5px]">
            <Button
              type="button"
              variant="outline"
              size="xs"
              className={metaphorChipClass(selectedMetaphor === '')}
              aria-pressed={selectedMetaphor === ''}
              onClick={() => onSelectMetaphor('')}>
              All
            </Button>
            {visibleMetaphors.map((metaphor) => (
              <Button
                key={metaphor}
                type="button"
                variant="outline"
                size="xs"
                className={metaphorChipClass(selectedMetaphor === metaphor)}
                title={metaphor}
                aria-pressed={selectedMetaphor === metaphor}
                onClick={() => onSelectMetaphor(metaphor)}>
                {metaphor}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <footer className="grid shrink-0 gap-2 border-t border-border pt-3">
        <span className="text-xs tabular-nums text-muted-foreground">
          {totalIconCount.toLocaleString()} icons in total
        </span>
        <p className="m-0 text-[11px] leading-[1.4] text-[var(--preview-muted)]">
          Created by{' '}
          <a
            href="https://oneo.me"
            target="_blank"
            rel="noreferrer"
            className="font-[760] text-[var(--preview-primary-text)] no-underline hover:underline">
            ONEO
          </a>{' '}
          using{' '}
          <a
            href="https://github.com/microsoft/fluentui-system-icons"
            target="_blank"
            rel="noreferrer"
            className="font-[760] text-[var(--preview-primary-text)] no-underline hover:underline">
            fluentui-system-icons
          </a>
        </p>
      </footer>
    </aside>
  );
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid min-w-0 gap-1.5 py-0.5">
      <div className={sectionHeadingClassName}>{title}</div>
      {children}
    </section>
  );
}

function chipClass(active: boolean): string {
  return cn(chipBaseClassName, active && chipActiveClassName);
}

function metaphorChipClass(active: boolean): string {
  return cn(
    chipBaseClassName,
    metaphorChipClassName,
    active && chipActiveClassName,
  );
}
