import type { ReactNode } from 'react';
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
    <aside className="filter-sidebar" aria-label="Icon filters">
      <div className="brand-block">
        <div className="brand-row">
          <span className="brand-mark">
            <img
              src={logoUrl}
              alt=""
              aria-hidden="true"
              className="brand-glow"
            />
            <img src={logoUrl} alt="FluentUI Icons Like logo" />
          </span>
          <div className="brand-copy">
            <h1>FluentUI Icons Like</h1>
            <span>{iconCount.toLocaleString()} icons</span>
          </div>
        </div>
        <a
          className="primary-link"
          href="https://github.com/oneo-me/fluentui-icons-like"
          target="_blank"
          rel="noreferrer"
        >
          Getting started
        </a>
      </div>

      <FilterSection title="Size">
        <div className="chip-grid chip-grid-size">
          {allSizes.map((size) => (
            <button
              key={size}
              type="button"
              className={chipClass(selectedSize === size)}
              onClick={() => onSelectSize(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Style">
        <div className="chip-grid chip-grid-style">
          {allStyles.map((style) => (
            <button
              key={style}
              type="button"
              className={chipClass(selectedStyle === style)}
              onClick={() => onSelectStyle(style)}
            >
              {style}
            </button>
          ))}
        </div>
      </FilterSection>

      <section className="filter-section filter-section-flex">
        <div className="section-heading">Metaphors</div>
        <label className="field-label">
          <span className="sr-only">Filter metaphors</span>
          <input
            className="text-field text-field-small"
            type="search"
            value={metaphorKeyword}
            placeholder="Filter metaphors"
            onChange={(event) =>
              onMetaphorKeywordChange(event.currentTarget.value)
            }
          />
        </label>
        <div className="metaphor-list">
          <button
            type="button"
            className={metaphorChipClass(selectedMetaphor === '')}
            onClick={() => onSelectMetaphor('')}
          >
            All
          </button>
          {visibleMetaphors.map((metaphor) => (
            <button
              key={metaphor}
              type="button"
              className={metaphorChipClass(selectedMetaphor === metaphor)}
              title={metaphor}
              onClick={() => onSelectMetaphor(metaphor)}
            >
              {metaphor}
            </button>
          ))}
        </div>
      </section>

      <p className="credit">
        Created by{' '}
        <a href="https://oneo.me" target="_blank" rel="noreferrer">
          ONEO
        </a>{' '}
        using{' '}
        <a
          href="https://github.com/microsoft/fluentui-system-icons"
          target="_blank"
          rel="noreferrer"
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
    <section className="filter-section">
      <div className="section-heading">{title}</div>
      {children}
    </section>
  );
}

function chipClass(active: boolean): string {
  return active ? 'chip chip-active' : 'chip';
}

function metaphorChipClass(active: boolean): string {
  return active ? 'chip metaphor-chip chip-active' : 'chip metaphor-chip';
}
