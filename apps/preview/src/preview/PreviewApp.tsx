import { useNavigate, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FilterSidebar } from './FilterSidebar';
import { IconCatalog } from './IconCatalog';
import { IconDetails } from './IconDetails';
import type { PreviewIconEntry, PreviewIconStyle } from './registry';
import { loadRegistry } from './registry';
import type { PreviewSearch } from './search';
import { searchKey, toUrlSearch } from './search';

const gap = 6;
const padding = 10;
const minOverscanRows = 8;
const maxOverscanRows = 24;
const defaultIconColor = '';
const themeIconColor = 'var(--color-foreground)';
const validScales = new Set([1, 2, 3]);

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
  const routeScale = getValidScale(routeSearchState.scale);
  const routeSearchKey = searchKey(routeSearchState);

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
  const [selectedScale, setSelectedScale] = useState(routeScale);
  const [themeColor, setThemeColor] = useState('oklch(0.332 0.018 255)');
  const [metaphorKeyword, setMetaphorKeyword] = useState('');
  const [containerWidth, setContainerWidth] = useState(900);
  const [containerHeight, setContainerHeight] = useState(620);
  const [scrollRow, setScrollRow] = useState(0);
  const gridRef = useRef<HTMLDivElement | null>(null);

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
    setSelectedScale(routeScale);
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
    routeScale,
    source,
  ]);

  const syncThemeColor = useCallback(() => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-foreground')
      .trim();
    if (color) setThemeColor(color);
  }, []);

  useEffect(() => {
    syncThemeColor();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const observer = new MutationObserver(syncThemeColor);
    media.addEventListener('change', syncThemeColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => {
      media.removeEventListener('change', syncThemeColor);
      observer.disconnect();
    };
  }, [syncThemeColor]);

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

  const displaySize = selectedSize * selectedScale;
  const baseItemSize = Math.max(36, displaySize + 24);
  const columnsPerRow = Math.max(
    1,
    Math.floor((Math.max(0, containerWidth) + gap) / (baseItemSize + gap)),
  );
  const itemSize =
    (Math.max(0, containerWidth) - gap * (columnsPerRow - 1)) / columnsPerRow;
  const rowHeight = itemSize + gap;
  const totalRows = Math.ceil(filtered.length / columnsPerRow);
  const viewportRows = Math.ceil(containerHeight / rowHeight);
  const overscanRows = Math.max(
    minOverscanRows,
    Math.min(maxOverscanRows, Math.ceil(viewportRows * 0.75)),
  );
  const startRow = Math.max(0, scrollRow - overscanRows);
  const visibleRows = viewportRows + overscanRows * 2 + 1;
  const startIndex = startRow * columnsPerRow;
  const endIndex = Math.min(
    filtered.length,
    (startRow + visibleRows) * columnsPerRow,
  );
  const visibleIcons = filtered.slice(startIndex, endIndex);
  const itemsTop = startRow * rowHeight;
  const effectiveSelectedColor = selectedColor || themeIconColor;
  const colorPickerValue = selectedColor || themeColor;

  const resetScroll = useCallback(() => {
    setScrollRow(0);
    if (gridRef.current) gridRef.current.scrollTop = 0;
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

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setContainerWidth(entry.contentRect.width);
      setContainerHeight(entry.contentRect.height);
      setScrollRow(Math.floor(el.scrollTop / rowHeight));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [rowHeight]);

  const nextSearch = useMemo(
    () =>
      toUrlSearch({
        q: keyword,
        size: selectedSize,
        style: selectedStyle,
        metaphor: selectedMetaphor,
        icon: selectedIcon?.key,
        color: selectedColor,
        scale: selectedScale,
      }),
    [
      keyword,
      selectedSize,
      selectedStyle,
      selectedMetaphor,
      selectedIcon,
      selectedColor,
      selectedScale,
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

  function onScroll() {
    const el = gridRef.current;
    if (!el) return;
    const nextScrollRow = Math.floor(el.scrollTop / rowHeight);
    if (nextScrollRow !== scrollRow) setScrollRow(nextScrollRow);
  }

  if (loading) {
    return (
      <div className="loading-shell">
        <span className="loading-mark" />
        <strong>Loading icon index</strong>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <FilterSidebar
        iconCount={source.length}
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
        keyword={keyword}
        leftFilteredCount={leftFiltered.length}
        filtered={filtered}
        visibleIcons={visibleIcons}
        selectedIcon={selectedIcon}
        selectedSize={selectedSize}
        selectedStyle={selectedStyle}
        selectedColor={selectedColor}
        effectiveSelectedColor={effectiveSelectedColor}
        colorPickerValue={colorPickerValue}
        selectedScale={selectedScale}
        gridRef={gridRef}
        totalRows={totalRows}
        rowHeight={rowHeight}
        padding={padding}
        columnsPerRow={columnsPerRow}
        itemsTop={itemsTop}
        itemSize={itemSize}
        onKeywordChange={(value) => {
          setKeyword(value);
          resetScroll();
        }}
        onColorChange={setSelectedColor}
        onScroll={onScroll}
        onSelectScale={(scale) => {
          if (!validScales.has(scale)) return;
          setSelectedScale(scale);
          resetScroll();
        }}
        onSelectIcon={setSelectedIcon}
      />

      <IconDetails
        selectedIcon={selectedIcon}
        selectedSize={selectedSize}
        selectedStyle={selectedStyle}
        selectedColor={effectiveSelectedColor}
      />
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
  return (
    terms.length === 0 ||
    terms.every((term) => getSearchText(icon).includes(term))
  );
}

function getValidScale(scale: number | undefined) {
  return validScales.has(scale ?? 1) ? (scale ?? 1) : 1;
}
