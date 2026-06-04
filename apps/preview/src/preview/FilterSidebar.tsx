import type { ReactNode } from 'react';
import { Button } from '#components/ui/button';
import { Input } from '#components/ui/input';
import { cn } from '#lib/utils';
import logoUrl from '../../../../logo.png';
import type { PreviewIconStyle } from './registry';

interface FilterSidebarProps {
  iconCount: number;
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
  'flex min-h-0 min-w-0 max-w-full flex-col gap-2.5 overflow-hidden border-r border-[var(--preview-border)] bg-[var(--preview-panel)] p-2.5 max-[760px]:max-h-[42vh] max-[760px]:border-r-0 max-[760px]:border-b';
const sectionHeadingClassName =
  'text-[11px] font-[780] tracking-[0.08em] text-[var(--preview-muted)] uppercase';
const fieldLabelClassName = 'block min-w-0';
const textFieldClassName =
  'h-[30px] w-full min-w-0 rounded-[7px] border border-[var(--preview-border)] bg-[var(--preview-background)] px-2.5 text-[10px] font-[560] text-[var(--preview-foreground)] shadow-[0_1px_2px_var(--preview-shadow)] outline-none placeholder:text-[var(--preview-muted)] focus-visible:border-[var(--preview-primary)] focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_oklab,var(--preview-primary)_18%,transparent)] md:text-[10px]';
const chipBaseClassName =
  'h-7 w-full min-w-0 cursor-pointer overflow-hidden rounded-[7px] border border-[var(--preview-border)] bg-[var(--preview-panel-strong)] px-[7px] text-[11px] font-[740] text-[var(--preview-foreground)] text-ellipsis transition-[border-color,background-color,color,box-shadow] duration-150 ease-out hover:border-[color-mix(in_oklab,var(--preview-primary)_48%,var(--preview-border))] hover:bg-[var(--preview-primary-soft)] hover:text-[var(--preview-primary-text)]';
const chipActiveClassName =
  'border-[color-mix(in_oklab,var(--preview-primary)_62%,var(--preview-border))] bg-[var(--preview-primary-soft)] text-[var(--preview-primary-text)] shadow-[inset_0_1px_0_color-mix(in_oklab,var(--preview-primary)_14%,transparent)]';
const metaphorChipClassName =
  'h-[25px] w-auto max-w-full min-w-0 shrink justify-start truncate px-1.5';

export function FilterSidebar({
  iconCount,
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
      <div className="grid gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative grid size-8 flex-none place-items-center">
            <img
              src={logoUrl}
              alt=""
              aria-hidden="true"
              className="absolute size-[62px] opacity-[0.18] blur-[8px]"
            />
            <img
              src={logoUrl}
              alt="FluentUI Icons Like logo"
              className="relative size-[30px] object-contain"
            />
          </span>
          <div className="min-w-0">
            <h1 className="m-0 text-[17px] leading-[1.05] font-semibold text-[var(--preview-foreground)] [overflow-wrap:anywhere]">
              FluentUI Icons Like
            </h1>
            <span className="mt-[3px] block text-[11px] font-[560] text-[var(--preview-muted)]">
              {iconCount.toLocaleString()} icons
            </span>
          </div>
        </div>
        <Button
          asChild
          className="h-8 rounded-[7px] border border-[var(--preview-primary)] bg-[var(--preview-primary)] text-[11px] font-[760] text-[oklch(0.985_0.004_255)] no-underline transition-[filter,transform] duration-150 ease-out hover:-translate-y-px hover:bg-[var(--preview-primary)] hover:brightness-[1.08]"
        >
          <a
            href="https://github.com/oneo-me/fluentui-icons-like"
            target="_blank"
            rel="noreferrer"
          >
            Getting started
          </a>
        </Button>
      </div>

      <FilterSection title="Size">
        <div className="grid grid-cols-4 gap-[5px]">
          {allSizes.map((size) => (
            <Button
              key={size}
              type="button"
              variant="outline"
              size="xs"
              className={chipClass(selectedSize === size)}
              onClick={() => onSelectSize(size)}
            >
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
              onClick={() => onSelectStyle(style)}
            >
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
              onClick={() => onSelectMetaphor('')}
            >
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
                onClick={() => onSelectMetaphor(metaphor)}
              >
                {metaphor}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <p className="m-0 pt-1 text-[11px] leading-[1.4] text-[var(--preview-muted)]">
        Created by{' '}
        <a
          href="https://oneo.me"
          target="_blank"
          rel="noreferrer"
          className="font-[760] text-[var(--preview-primary-text)] no-underline hover:underline"
        >
          ONEO
        </a>{' '}
        using{' '}
        <a
          href="https://github.com/microsoft/fluentui-system-icons"
          target="_blank"
          rel="noreferrer"
          className="font-[760] text-[var(--preview-primary-text)] no-underline hover:underline"
        >
          fluentui-system-icons
        </a>
      </p>
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
    <section className="grid min-w-0 gap-2 py-1">
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
