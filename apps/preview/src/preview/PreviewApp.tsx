import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '#components/ui/button';
import { Input } from '#components/ui/input';
import logoUrl from '../../../../logo.png';
import ChevronDownIcon from '../../../../packages/react/src/icons/FluentIconChevronDown';
import { FilterSidebar } from './FilterSidebar';
import { IconCatalog } from './IconCatalog';
import { IconDetails } from './IconDetails';
import {
  getStoredPackageTab,
  isPackageTabId,
  setStoredPackageTab,
} from './integration';
import type { PackageTabId } from './integration';
import type { PreviewIconEntry, PreviewIconStyle } from './registry';
import { loadRegistry } from './registry';
import type { PreviewSearch } from './search';
import { searchKey, toUrlSearch } from './search';

const defaultIconColor = '';
const appShellClassName =
  'grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_280px] overflow-hidden max-[980px]:grid-cols-[210px_minmax(0,1fr)] max-[760px]:grid-cols-1 max-[760px]:grid-rows-[auto_minmax(0,1fr)]';
const loadingShellClassName =
  'grid min-h-dvh place-items-center content-center gap-3 text-muted-foreground';
const loadingMarkClassName =
  'size-[38px] rounded-full border border-[var(--preview-border)] border-t-[var(--preview-primary)] motion-safe:animate-[spin_840ms_linear_infinite]';

export function PreviewApp() {
  const routeSearch = useSearch({ from: '/' });
  const navigate = useNavigate({ from: '/' });
  const routeSearchState = routeSearch as PreviewSearch;
  const routeKeyword = routeSearchState.q ?? '';
  const routeSize = routeSearchState.size ?? 20;
  const routeStyle = routeSearchState.style ?? 'Regular';
  const routeMetaphor = routeSearchState.metaphor ?? '';
  const routeIcon = routeSearchState.icon;
  const routeColor = routeSearchState.color ?? defaultIconColor;
  const routeSearchKey = searchKey(routeSearchState);

  const [activePackage, setActivePackage] =
    useState<PackageTabId>(getStoredPackageTab);

  useEffect(() => {
    setStoredPackageTab(activePackage);
  }, [activePackage]);

  const [source, setSource] = useState<PreviewIconEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState(routeKeyword);
  const [selectedSize, setSelectedSize] = useState(routeSize);
  const [selectedStyle, setSelectedStyle] =
    useState<PreviewIconStyle>(routeStyle);
  const [selectedMetaphor, setSelectedMetaphor] = useState(routeMetaphor);
  const [selectedIcon, setSelectedIcon] = useState<PreviewIconEntry | null>(
    null,
  );
  const [selectedColor, setSelectedColor] = useState(routeColor);
  const [metaphorKeyword, setMetaphorKeyword] = useState('');
  const catalogScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    void loadRegistry().then((registry) => {
      if (!active) return;
      setSource(registry);
      const iconFromUrl = routeIcon
        ? registry.find((icon) => icon.key === routeIcon)
        : null;
      setSelectedIcon(iconFromUrl ?? registry[0] ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [routeIcon]);

  useEffect(() => {
    setKeyword(routeKeyword);
    setSelectedSize(routeSize);
    setSelectedStyle(routeStyle);
    setSelectedMetaphor(routeMetaphor);
    setSelectedColor(routeColor);
    if (source.length) {
      setSelectedIcon(
        routeIcon
          ? (source.find((icon) => icon.key === routeIcon) ?? source[0] ?? null)
          : (source[0] ?? null),
      );
    }
  }, [
    routeKeyword,
    routeSize,
    routeStyle,
    routeMetaphor,
    routeIcon,
    routeColor,
    source,
  ]);

  const allSizes = useMemo(
    () =>
      Array.from(new Set(source.flatMap((icon) => icon.sizes))).sort(
        (a, b) => a - b,
      ),
    [source],
  );

  const allStyles = useMemo(
    () => Array.from(new Set(source.flatMap((icon) => icon.styles))).sort(),
    [source],
  );

  const allMetaphors = useMemo(
    () =>
      Array.from(
        new Set(
          source
            .filter(
              (icon) =>
                icon.sizes.includes(selectedSize) &&
                icon.styles.includes(selectedStyle),
            )
            .flatMap(getMetaphors),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [source, selectedSize, selectedStyle],
  );

  const visibleMetaphors = useMemo(
    () =>
      allMetaphors.filter((metaphor) =>
        metaphor.toLowerCase().includes(metaphorKeyword.trim().toLowerCase()),
      ),
    [allMetaphors, metaphorKeyword],
  );

  const leftFiltered = useMemo(
    () =>
      source.filter((icon) => {
        const matchesSize = icon.sizes.includes(selectedSize);
        const matchesStyle = icon.styles.includes(selectedStyle);
        const matchesMetaphor =
          selectedMetaphor === '' ||
          getMetaphors(icon).includes(selectedMetaphor);
        return matchesSize && matchesStyle && matchesMetaphor;
      }),
    [source, selectedSize, selectedStyle, selectedMetaphor],
  );

  const filtered = useMemo(
    () => leftFiltered.filter((icon) => matchesSearch(icon, keyword)),
    [leftFiltered, keyword],
  );

  const resetScroll = useCallback(() => {
    if (catalogScrollRef.current) catalogScrollRef.current.scrollTop = 0;
  }, []);

  useEffect(() => {
    if (source.length === 0) return;
    if (!allSizes.includes(selectedSize)) {
      setSelectedSize(allSizes.includes(20) ? 20 : allSizes[0]);
      resetScroll();
    }
    if (!allStyles.includes(selectedStyle)) {
      setSelectedStyle(
        allStyles.includes('Regular') ? 'Regular' : allStyles[0],
      );
      resetScroll();
    }
  }, [
    source.length,
    allSizes,
    allStyles,
    selectedSize,
    selectedStyle,
    resetScroll,
  ]);

  useEffect(() => {
    if (selectedMetaphor && !allMetaphors.includes(selectedMetaphor)) {
      setSelectedMetaphor('');
      resetScroll();
    }
  }, [allMetaphors, selectedMetaphor, resetScroll]);

  useEffect(() => {
    if (
      selectedIcon &&
      !filtered.some((icon) => icon.key === selectedIcon.key)
    ) {
      setSelectedIcon(filtered[0] ?? null);
      return;
    }
    if (!selectedIcon && filtered.length) {
      setSelectedIcon(filtered[0]);
    }
  }, [filtered, selectedIcon]);

  const nextSearch = useMemo(
    () =>
      toUrlSearch({
        q: keyword,
        size: selectedSize,
        style: selectedStyle,
        metaphor: selectedMetaphor,
        icon: selectedIcon?.key,
        color: selectedColor,
      }),
    [
      keyword,
      selectedSize,
      selectedStyle,
      selectedMetaphor,
      selectedIcon,
      selectedColor,
    ],
  );

  useEffect(() => {
    if (loading) return;
    if (searchKey(nextSearch) === routeSearchKey) return;
    void navigate({
      to: '/',
      search: nextSearch,
      replace: true,
    });
  }, [loading, navigate, nextSearch, routeSearchKey]);

  if (loading) {
    return (
      <div className={loadingShellClassName}>
        <span className={loadingMarkClassName} />
        <strong className="text-[13px] text-[var(--preview-foreground)]">
          Loading icon index
        </strong>
      </div>
    );
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
      <header className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src={logoUrl}
            alt=""
            className="size-8 shrink-0 object-contain"
          />
          <div className="min-w-0">
            <h1 className="m-0 text-[17px] font-semibold leading-tight">
              FluentUI Icons Like
            </h1>
          </div>
        </div>
        <label
          className="relative ml-auto w-[300px] min-w-0 max-[900px]:order-last max-[900px]:ml-0 max-[900px]:w-full"
          htmlFor="icon-search-input">
          <span className="sr-only">Search icons</span>
          <Input
            id="icon-search-input"
            className="h-10 pr-28"
            type="search"
            value={keyword}
            placeholder="Search icons…"
            onChange={(event) => {
              setKeyword(event.currentTarget.value);
              resetScroll();
            }}
          />
          <output
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs tabular-nums text-muted-foreground"
            aria-live="polite">
            {filtered.length.toLocaleString()} icons
          </output>
        </label>
        <div className="flex items-center gap-2 max-[900px]:ml-auto max-[600px]:w-full max-[600px]:justify-end">
          <label
            className="relative text-xs font-medium"
            htmlFor="integration-target">
            <span className="sr-only">Framework</span>
            <select
              id="integration-target"
              value={activePackage}
              className="h-10 appearance-none rounded-md border border-input bg-card pr-9 pl-3 text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/22"
              onChange={(event) => {
                if (isPackageTabId(event.currentTarget.value))
                  setActivePackage(event.currentTarget.value);
              }}>
              <option value="react">React</option>
              <option value="svelte">Svelte</option>
              <option value="avalonia">Avalonia</option>
              <option value="wpf">WPF · Experimental</option>
            </select>
            <ChevronDownIcon
              size={16}
              title={null}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
            />
          </label>
          <Button asChild className="h-10 no-underline">
            <a
              href="https://github.com/oneo-me/fluentui-icons-like"
              target="_blank"
              rel="noreferrer">
              Getting started
            </a>
          </Button>
        </div>
      </header>
      <div className={appShellClassName}>
        <FilterSidebar
          totalIconCount={source.length}
          allSizes={allSizes}
          allStyles={allStyles}
          visibleMetaphors={visibleMetaphors}
          selectedSize={selectedSize}
          selectedStyle={selectedStyle}
          selectedMetaphor={selectedMetaphor}
          metaphorKeyword={metaphorKeyword}
          onMetaphorKeywordChange={setMetaphorKeyword}
          onSelectSize={(size) => {
            setSelectedSize(size);
            resetScroll();
          }}
          onSelectStyle={(style) => {
            setSelectedStyle(style);
            resetScroll();
          }}
          onSelectMetaphor={(metaphor) => {
            setSelectedMetaphor(metaphor);
            resetScroll();
          }}
        />

        <IconCatalog
          filtered={filtered}
          selectedIcon={selectedIcon}
          selectedSize={selectedSize}
          selectedStyle={selectedStyle}
          scrollRef={catalogScrollRef}
          onSelectIcon={setSelectedIcon}
        />

        <IconDetails
          activePackage={activePackage}
          selectedIcon={selectedIcon}
          selectedSize={selectedSize}
          selectedStyle={selectedStyle}
          pngColor={selectedColor}
          onPngColorChange={setSelectedColor}
        />
      </div>
    </div>
  );
}

function getMetaphors(icon: PreviewIconEntry) {
  return icon.metaphor
    .map((metaphor) => metaphor.trim())
    .filter((metaphor) => metaphor.length > 0);
}

function getSearchText(icon: PreviewIconEntry) {
  return [
    icon.key,
    icon.name,
    icon.keyword,
    icon.description,
    ...icon.styles,
    ...icon.sizes.map(String),
    ...getMetaphors(icon),
  ]
    .join(' ')
    .toLowerCase();
}

function matchesSearch(icon: PreviewIconEntry, keyword: string) {
  const terms = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => getSearchText(icon).includes(term));
}
