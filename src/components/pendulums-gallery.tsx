"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeftRight } from "lucide-react";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";

type Attribute = {
  trait_type: string;
  value: string;
};

type RawPendulumItem = {
  token_id: number | string;
  name?: string;
  image_uri?: string;
  animation_url?: string;
  attributes?: Attribute[];
};

type PendulumItem = {
  token_id: number;
  name: string;
  image_uri: string;
  animation_url: string;
  attributes: Attribute[];
  perfection_score: number | null;
  cycle_count: number | null;
  attrMap: Map<string, string>;
};

type SortMode =
  | "token_asc"
  | "token_desc"
  | "perfection_desc"
  | "perfection_asc"
  | "cycle_desc"
  | "cycle_asc";

type ListingInfo = {
  isListed: boolean;
  rawPrice: string | null;
  displayPrice: string | null;
  currency: string | null;
  ownerAddress: string | null;
  fetchedAt: string;
};

type ListedPriceSort = "price_desc" | "price_asc";

const PAGE_SIZE = 60;
const MIN_GRID_EXPORT_SIZE = 4096;
const PREVIEW_GRID_GAP_PX = 2;
const DESCRIPTION =
  "Pendulums began as a simulator, a way to preview the motion behind Chapter 1: Lux, a series of physical pendulum photographs shaped by light and time. But the code started to feel like something more. Each piece in Chapter 2 is the trace of a system in motion, governed by real physics: damping, amplitude, period ratios, decay. These are not imagined curves, but paths shaped by natural law, rendered in code. Some settle. Some resist. Each image is a fossil of energy resolving into stillness, a quiet record of the universe at work.";

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "token_asc", label: "Token id, low to high" },
  { value: "token_desc", label: "Token id, high to low" },
  { value: "perfection_desc", label: "Perfection Score, high to low" },
  { value: "perfection_asc", label: "Perfection Score, low to high" },
  { value: "cycle_desc", label: "Cycle Count, high to low" },
  { value: "cycle_asc", label: "Cycle Count, low to high" },
];

const LISTED_PRICE_SORT_OPTIONS: Array<{ value: ListedPriceSort; label: string }> = [
  { value: "price_desc", label: "Price: High to low" },
  { value: "price_asc", label: "Price: Low to high" },
];

function normalize(value: unknown) {
  return String(value ?? "").trim();
}

function toNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function getAttributeValue(attributes: Attribute[], traitName: string) {
  const target = normalize(traitName).toLowerCase();
  for (const attr of attributes) {
    if (normalize(attr.trait_type).toLowerCase() === target) {
      return attr.value;
    }
  }
  return null;
}

function compareNullableNumbers(a: number | null, b: number | null, dir: 1 | -1) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return dir * (a - b);
}

function makeOpenSeaUrl(tokenId: number) {
  return `https://opensea.io/assets/ethereum/0x4af0370076a44c8ddc23db9ae5cecba669280372/${tokenId}`;
}

function normalizeWalletLookupInput(value: string) {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function getOptimalGridDimensions(count: number) {
  if (count <= 0) return { columns: 1, rows: 1 };

  let bestColumns = 1;
  let bestRows = count;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let columns = 1; columns <= count; columns += 1) {
    const rows = Math.ceil(count / columns);
    const emptyCells = rows * columns - count;
    const aspectPenalty = Math.abs(columns - rows);
    const score = emptyCells * 2 + aspectPenalty;

    if (score < bestScore) {
      bestScore = score;
      bestColumns = columns;
      bestRows = rows;
    }
  }

  return { columns: bestColumns, rows: bestRows };
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.referrerPolicy = "no-referrer";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    image.src = url;
  });
}

function drawImageCoverSquare(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  size: number
) {
  const scale = Math.max(size / image.width, size / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const drawX = x + (size - drawWidth) / 2;
  const drawY = y + (size - drawHeight) / 2;
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function matchesFilters(item: PendulumItem, query: string, selected: Map<string, Set<string>>) {
  if (query) {
    const name = item.name.toLowerCase();
    const token = String(item.token_id);
    if (!name.includes(query) && !token.includes(query)) {
      return false;
    }
  }

  if (selected.size === 0) {
    return true;
  }

  for (const [trait, values] of selected.entries()) {
    const value = item.attrMap.get(trait);
    if (!value || !values.has(value)) {
      return false;
    }
  }
  return true;
}

function sortItems(items: PendulumItem[], mode: SortMode) {
  const next = items.slice();
  if (mode === "token_asc") next.sort((a, b) => a.token_id - b.token_id);
  if (mode === "token_desc") next.sort((a, b) => b.token_id - a.token_id);
  if (mode === "perfection_asc") {
    next.sort((a, b) => compareNullableNumbers(a.perfection_score, b.perfection_score, 1));
  }
  if (mode === "perfection_desc") {
    next.sort((a, b) => compareNullableNumbers(a.perfection_score, b.perfection_score, -1));
  }
  if (mode === "cycle_asc") {
    next.sort((a, b) => compareNullableNumbers(a.cycle_count, b.cycle_count, 1));
  }
  if (mode === "cycle_desc") {
    next.sort((a, b) => compareNullableNumbers(a.cycle_count, b.cycle_count, -1));
  }
  return next;
}

export function PendulumsGallery() {
  const [all, setAll] = useState<PendulumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("token_asc");
  const [selected, setSelected] = useState<Map<string, Set<string>>>(new Map());
  const [onlyListed, setOnlyListed] = useState(false);
  const [listedPriceSort, setListedPriceSort] = useState<ListedPriceSort>("price_desc");

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeItem, setActiveItem] = useState<PendulumItem | null>(null);
  const [listingByTokenId, setListingByTokenId] = useState<Record<number, ListingInfo>>({});
  const [listingsLoading, setListingsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isGridDialogOpen, setIsGridDialogOpen] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [activeWalletAddress, setActiveWalletAddress] = useState<string | null>(null);
  const [walletTokenIds, setWalletTokenIds] = useState<number[]>([]);
  const [walletGridOrder, setWalletGridOrder] = useState<number[]>([]);
  const [walletLookupError, setWalletLookupError] = useState("");
  const [walletFetchLoading, setWalletFetchLoading] = useState(false);
  const [isExportingGrid, setIsExportingGrid] = useState(false);
  const [gridExportError, setGridExportError] = useState("");
  const [isGridOrientationSwapped, setIsGridOrientationSwapped] = useState(false);
  const [previewCellSize, setPreviewCellSize] = useState(0);
  const [isGridDragging, setIsGridDragging] = useState(false);
  const [draggingTileIndex, setDraggingTileIndex] = useState<number | null>(null);
  const [dragGhostPosition, setDragGhostPosition] = useState<{ x: number; y: number } | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const gridPreviewFrameRef = useRef<HTMLDivElement | null>(null);
  const dragTargetPositionRef = useRef<{ x: number; y: number } | null>(null);
  const dragCurrentPositionRef = useRef<{ x: number; y: number } | null>(null);
  const dragPointerOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragAnimationFrameRef = useRef<number | null>(null);
  const query = search.trim().toLowerCase();
  const listedSortLabel =
    LISTED_PRICE_SORT_OPTIONS.find((option) => option.value === listedPriceSort)?.label ?? "Sort by price";

  useEffect(() => {
    let isMounted = true;

    fetch("/data/pendulums_1-512.json", { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load metadata: ${response.status}`);
        }
        return response.json();
      })
      .then((data: RawPendulumItem[]) => {
        if (!isMounted) return;
        const parsed = data
          .map((item) => {
            const attributes = Array.isArray(item.attributes) ? item.attributes : [];
            const attrMap = new Map<string, string>();
            for (const attr of attributes) {
              const trait = normalize(attr.trait_type);
              if (!trait) continue;
              attrMap.set(trait, normalize(attr.value));
            }

            return {
              token_id: Number(item.token_id),
              name: normalize(item.name) || `Pendulum #${item.token_id}`,
              image_uri: normalize(item.image_uri),
              animation_url: normalize(item.animation_url),
              attributes,
              perfection_score: toNumber(getAttributeValue(attributes, "Perfection Score")),
              cycle_count: toNumber(getAttributeValue(attributes, "Cycle Count")),
              attrMap,
            } satisfies PendulumItem;
          })
          .sort((a, b) => a.token_id - b.token_id);

        setAll(parsed);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Error loading metadata");
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filterData = useMemo(() => {
    const typeValueCounts = new Map<string, Map<string, number>>();

    for (const item of all) {
      for (const attr of item.attributes) {
        const trait = normalize(attr.trait_type);
        const value = normalize(attr.value);
        if (!trait) continue;
        if (!typeValueCounts.has(trait)) {
          typeValueCounts.set(trait, new Map());
        }
        const valueCounts = typeValueCounts.get(trait);
        if (!valueCounts) continue;
        valueCounts.set(value, (valueCounts.get(value) ?? 0) + 1);
      }
    }

    const traitTypes = Array.from(typeValueCounts.keys()).sort((a, b) => a.localeCompare(b));
    return { traitTypes, typeValueCounts };
  }, [all]);

  const baseFilteredSorted = useMemo(() => {
    const filtered = all.filter((item) => matchesFilters(item, query, selected));
    return sortItems(filtered, sort);
  }, [all, query, selected, sort]);

  const filteredSorted = useMemo(() => {
    if (!onlyListed) return baseFilteredSorted;
    const listed = baseFilteredSorted.filter((item) => listingByTokenId[item.token_id]?.isListed);
    const dir = listedPriceSort === "price_desc" ? -1 : 1;

    listed.sort((a, b) => {
      const rawA = listingByTokenId[a.token_id]?.rawPrice;
      const rawB = listingByTokenId[b.token_id]?.rawPrice;
      if (!rawA && !rawB) return 0;
      if (!rawA) return 1;
      if (!rawB) return -1;

      try {
        const priceA = BigInt(rawA);
        const priceB = BigInt(rawB);
        if (priceA === priceB) return 0;
        return priceA > priceB ? dir : -dir;
      } catch {
        return 0;
      }
    });

    return listed;
  }, [baseFilteredSorted, listingByTokenId, onlyListed, listedPriceSort]);

  const visibleItems = useMemo(
    () => filteredSorted.slice(0, visibleCount),
    [filteredSorted, visibleCount]
  );

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (visibleCount >= filteredSorted.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredSorted.length));
      },
      { rootMargin: "1200px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [filteredSorted.length, visibleCount]);

  const fetchListings = useCallback(async (signal?: AbortSignal) => {
    setListingsLoading(true);
    try {
      const response = await fetch(`/api/listings/status`, {
        method: "GET",
        signal,
        cache: "no-store",
      });
      if (!response.ok) return null;
      const payload = (await response.json()) as {
        listings?: Record<string, ListingInfo>;
      };
      if (!payload.listings) return null;

      const next: Record<number, ListingInfo> = {};
      for (const [tokenId, listing] of Object.entries(payload.listings)) {
        next[Number(tokenId)] = listing;
      }

      setListingByTokenId(next);
      return next;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return null;
      return null;
    } finally {
      setListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchListings(controller.signal);
    const intervalId = window.setInterval(() => {
      void fetchListings();
    }, 60_000);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [fetchListings]);

  const activeListing = activeItem ? listingByTokenId[activeItem.token_id] ?? null : null;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveItem(null);
        setIsFiltersOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const updateFromMediaQuery = () => setIsDesktop(mediaQuery.matches);
    const raf = window.requestAnimationFrame(updateFromMediaQuery);
    mediaQuery.addEventListener("change", updateFromMediaQuery);
    return () => {
      window.cancelAnimationFrame(raf);
      mediaQuery.removeEventListener("change", updateFromMediaQuery);
    };
  }, []);

  function toggleFilter(trait: string, value: string, checked: boolean) {
    setVisibleCount(PAGE_SIZE);
    setSelected((current) => {
      const next = new Map(current);
      const existing = new Set(next.get(trait) ?? []);
      if (checked) existing.add(value);
      else existing.delete(value);
      if (existing.size > 0) next.set(trait, existing);
      else next.delete(trait);
      return next;
    });
  }

  function clearAll() {
    setVisibleCount(PAGE_SIZE);
    setSearch("");
    setSelected(new Map());
    setSort("token_asc");
    setOnlyListed(false);
    setListedPriceSort("price_desc");
  }

  function applySingleAttributeFilter(trait: string, value: string) {
    setVisibleCount(PAGE_SIZE);
    setSelected((current) => {
      const next = new Map(current);
      next.set(trait, new Set([value]));
      return next;
    });
    setActiveItem(null);
  }

  const selectedFilterChips = Array.from(selected.entries()).flatMap(([trait, values]) =>
    Array.from(values).map((value) => ({ trait, value }))
  );
  const walletTokenIdSet = useMemo(() => new Set(walletTokenIds), [walletTokenIds]);
  const walletOwnedItems = useMemo(
    () => all.filter((item) => walletTokenIdSet.has(item.token_id)).sort((a, b) => a.token_id - b.token_id),
    [all, walletTokenIdSet]
  );
  const walletItemByTokenId = useMemo(
    () => new Map(walletOwnedItems.map((item) => [item.token_id, item] as const)),
    [walletOwnedItems]
  );
  const orderedWalletItems = useMemo(() => {
    if (walletGridOrder.length === 0) return walletOwnedItems;
    return walletGridOrder.map((tokenId) => walletItemByTokenId.get(tokenId)).filter((item): item is PendulumItem => Boolean(item));
  }, [walletGridOrder, walletItemByTokenId, walletOwnedItems]);
  const optimalGridDimensions = useMemo(
    () => getOptimalGridDimensions(orderedWalletItems.length),
    [orderedWalletItems.length]
  );
  const canSwapGridOrientation = optimalGridDimensions.columns !== optimalGridDimensions.rows;
  const gridDimensions = useMemo(() => {
    if (!isGridOrientationSwapped || !canSwapGridOrientation) {
      return optimalGridDimensions;
    }
    return {
      columns: optimalGridDimensions.rows,
      rows: optimalGridDimensions.columns,
    };
  }, [canSwapGridOrientation, isGridOrientationSwapped, optimalGridDimensions]);
  const draggingGridItem =
    draggingTileIndex !== null && draggingTileIndex >= 0 ? orderedWalletItems[draggingTileIndex] ?? null : null;

  useEffect(() => {
    setWalletGridOrder(walletOwnedItems.map((item) => item.token_id));
    setDraggingTileIndex(null);
    setIsGridDragging(false);
    setIsGridOrientationSwapped(false);
    setDragGhostPosition(null);
    dragTargetPositionRef.current = null;
    dragCurrentPositionRef.current = null;
  }, [walletOwnedItems]);

  useLayoutEffect(() => {
    const frame = gridPreviewFrameRef.current;
    if (!frame) return;

    const recalculate = () => {
      const { width, height } = frame.getBoundingClientRect();
      if (width <= 0 || height <= 0 || orderedWalletItems.length === 0) {
        setPreviewCellSize(0);
        return;
      }
      const widthForCells = width - PREVIEW_GRID_GAP_PX * Math.max(0, gridDimensions.columns - 1);
      const heightForCells = height - PREVIEW_GRID_GAP_PX * Math.max(0, gridDimensions.rows - 1);
      const maxByWidth = Math.floor(widthForCells / gridDimensions.columns);
      const maxByHeight = Math.floor(heightForCells / gridDimensions.rows);
      setPreviewCellSize(Math.max(1, Math.min(maxByWidth, maxByHeight)));
    };

    recalculate();
    const observer = new ResizeObserver(recalculate);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [gridDimensions.columns, gridDimensions.rows, orderedWalletItems.length, isGridDialogOpen]);

  function reorderGridItem(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setWalletGridOrder((current) => {
      if (fromIndex >= current.length || toIndex >= current.length) return current;
      const next = current.slice();
      const [moved] = next.splice(fromIndex, 1);
      if (moved === undefined) return current;
      next.splice(toIndex, 0, moved);
      return next;
    });
    setDraggingTileIndex(toIndex);
  }

  function finishGridDrag() {
    setIsGridDragging(false);
    setDraggingTileIndex(null);
    setDragGhostPosition(null);
    dragTargetPositionRef.current = null;
    dragCurrentPositionRef.current = null;
    if (dragAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(dragAnimationFrameRef.current);
      dragAnimationFrameRef.current = null;
    }
  }

  useEffect(() => {
    if (!isGridDragging) return;

    const onPointerMove = (event: PointerEvent) => {
      if (draggingTileIndex === null) return;
      const { clientX, clientY } = event;
      dragTargetPositionRef.current = { x: clientX, y: clientY };
      if (!dragCurrentPositionRef.current) {
        dragCurrentPositionRef.current = { x: clientX, y: clientY };
        setDragGhostPosition({ x: clientX, y: clientY });
      }

      const target = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const tile = target?.closest("[data-grid-tile-index]") as HTMLElement | null;
      if (!tile) return;

      const nextIndex = Number(tile.dataset.gridTileIndex);
      if (!Number.isInteger(nextIndex) || nextIndex === draggingTileIndex) return;
      reorderGridItem(draggingTileIndex, nextIndex);
    };

    const onPointerUp = () => {
      finishGridDrag();
    };

    const animate = () => {
      const target = dragTargetPositionRef.current;
      const current = dragCurrentPositionRef.current;
      if (target && current) {
        const damping = 0.2;
        const next = {
          x: current.x + (target.x - current.x) * damping,
          y: current.y + (target.y - current.y) * damping,
        };
        dragCurrentPositionRef.current = next;
        setDragGhostPosition(next);
      }
      dragAnimationFrameRef.current = window.requestAnimationFrame(animate);
    };

    dragAnimationFrameRef.current = window.requestAnimationFrame(animate);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      if (dragAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(dragAnimationFrameRef.current);
        dragAnimationFrameRef.current = null;
      }
    };
  }, [draggingTileIndex, isGridDragging]);

  async function fetchWalletPendulums() {
    setWalletLookupError("");
    setGridExportError("");

    const normalized = normalizeWalletLookupInput(walletInput);
    if (!normalized) {
      setActiveWalletAddress(null);
      setWalletTokenIds([]);
      setWalletLookupError("Enter a wallet address or ENS name.");
      return;
    }

    setWalletFetchLoading(true);
    try {
      const response = await fetch(`/api/owners/pendulums?wallet=${encodeURIComponent(normalized)}`, {
        method: "GET",
        cache: "no-store",
      });
      const payload = (await response.json()) as {
        error?: string;
        input?: string;
        inputType?: "address" | "ens";
        ensName?: string | null;
        wallet?: string;
        tokenIds?: number[];
      };

      if (!response.ok) {
        throw new Error(payload.error ?? `Wallet fetch failed: ${response.status}`);
      }

      setActiveWalletAddress(payload.wallet ?? normalized);
      setWalletTokenIds(Array.isArray(payload.tokenIds) ? payload.tokenIds : []);
    } catch (error) {
      setActiveWalletAddress(null);
      setWalletTokenIds([]);
      setWalletLookupError(error instanceof Error ? error.message : "Failed to fetch wallet pendulums.");
    } finally {
      setWalletFetchLoading(false);
    }
  }

  async function downloadWalletGridPng() {
    if (orderedWalletItems.length === 0) return;

    setIsExportingGrid(true);
    setGridExportError("");
    try {
      const { columns, rows } = gridDimensions;
      const isLandscape = columns >= rows;
      const cellSize = isLandscape ? MIN_GRID_EXPORT_SIZE / columns : MIN_GRID_EXPORT_SIZE / rows;
      const exportWidth = isLandscape ? MIN_GRID_EXPORT_SIZE : Math.round(cellSize * columns);
      const exportHeight = isLandscape ? Math.round(cellSize * rows) : MIN_GRID_EXPORT_SIZE;

      const canvas = document.createElement("canvas");
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not create export canvas.");
      }

      context.fillStyle = "#fffcf7";
      context.fillRect(0, 0, exportWidth, exportHeight);

      for (let index = 0; index < orderedWalletItems.length; index += 1) {
        const item = orderedWalletItems[index];
        const col = index % columns;
        const row = Math.floor(index / columns);
        const x = col * cellSize;
        const y = row * cellSize;

        try {
          const image = await loadImage(item.image_uri);
          drawImageCoverSquare(context, image, x, y, cellSize);
        } catch {
          context.fillStyle = "#f3ecdf";
          context.fillRect(x, y, cellSize, cellSize);
        }
      }

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => {
          if (!value) {
            reject(new Error("PNG export failed."));
            return;
          }
          resolve(value);
        }, "image/png");
      });

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `pendulums-grid-${orderedWalletItems.length}-${(activeWalletAddress ?? "wallet").slice(2, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setGridExportError(error instanceof Error ? error.message : "Grid export failed.");
    } finally {
      setIsExportingGrid(false);
    }
  }

  const filtersUi = (
    <>
      <input
        value={search}
        onChange={(event) => {
          setVisibleCount(PAGE_SIZE);
          setSearch(event.target.value);
        }}
        placeholder="Search name or token id"
        className="mb-3 w-full border border-border bg-background px-3 py-2 text-sm outline-none"
      />

      <div className="mb-3 flex gap-2">
        <select
          value={sort}
          onChange={(event) => {
            setVisibleCount(PAGE_SIZE);
            setSort(event.target.value as SortMode);
          }}
          className="w-full border border-border bg-background px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={clearAll} className="border border-border bg-background px-3 py-2 text-sm">
          Clear
        </button>
      </div>

      {selected.size > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {Array.from(selected.entries()).flatMap(([trait, values]) =>
            Array.from(values).map((value) => (
              <button
                key={`${trait}:${value}`}
                type="button"
                onClick={() => toggleFilter(trait, value, false)}
                className="border border-border bg-[#f3ecdf] px-2 py-1 text-xs"
              >
                {trait}: {value} x
              </button>
            ))
          )}
        </div>
      ) : null}

      <div className="space-y-2">
        {filterData.traitTypes.map((trait) => {
          const values = Array.from(filterData.typeValueCounts.get(trait)?.entries() ?? [])
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => a.count - b.count || a.value.localeCompare(b.value));

          return (
            <details key={trait} className="border border-border bg-background px-3 py-2">
              <summary className="cursor-pointer text-sm">{trait}</summary>
              <div className="mt-2 flex flex-wrap gap-2">
                {values.map(({ value, count }) => {
                  const checked = selected.get(trait)?.has(value) ?? false;
                  return (
                    <label
                      key={`${trait}:${value}`}
                      className="inline-flex cursor-pointer items-center gap-2 border border-border bg-[#f3ecdf] px-2 py-1 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => toggleFilter(trait, value, event.target.checked)}
                      />
                      <span>
                        {value} ({count})
                      </span>
                    </label>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </>
  );

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col items-start gap-4">
        <div className="w-full">
          <div className="mb-12 flex items-center justify-center gap-4 md:mb-16 md:gap-6">
            <span className="h-[2px] w-16 bg-gradient-to-r from-transparent to-foreground/40 md:w-60" />
            <h1 className="text-3xl text-foreground/80 md:text-5xl">The Gallery</h1>
            <span className="h-[2px] w-16 bg-gradient-to-l from-transparent to-foreground/40 md:w-60" />
          </div>
          <p className="mb-10 text-base leading-8 text-foreground/80 md:text-lg">
            This gallery presents the complete Pendulums collection of 512 works. Use the filters to explore the
            system from different angles, sorting pieces by parameters such as period ratios, amplitudes, damping,
            cycle count, and more. Each artwork includes its full output profile, revealing the variables that shaped
            its motion. You can also view current market listings and link directly to OpenSea to see the piece in
            the secondary market.
          </p>
        </div>
        <div className="flex w-full flex-col items-start gap-2 md:w-auto md:max-w-[48vw]">
          <div className="mb-12 w-full border border-border bg-[#fff9ef] p-3 text-left md:max-w-[700px]">
            <h2 className="text-sm uppercase tracking-[0.12em] text-foreground">Generate Your Pendulums Grid</h2>
            <p className="mt-2 mb-3 text-sm leading-6 text-foreground/80">
              Enter your wallet in the dialog to fetch your Pendulums and export a high-resolution PNG grid.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsGridDialogOpen(true)}
              className="rounded-none text-sm"
            >
              Generate my grid
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Drawer open={isFiltersOpen} onOpenChange={setIsFiltersOpen} direction={isDesktop ? "left" : "bottom"}>
              <button
                type="button"
                className="border border-border bg-background px-3 py-2 text-sm"
                onClick={() => setIsFiltersOpen(true)}
              >
                Filters
              </button>
              <DrawerContent className={isDesktop ? "h-full w-[360px] max-w-none" : ""}>
                <DrawerHeader>
                  <DrawerTitle>Filters</DrawerTitle>
                  <DrawerDescription>Search, sort, and refine pendulum outputs.</DrawerDescription>
                </DrawerHeader>
                <div className={`${isDesktop ? "h-full overflow-y-auto" : "max-h-[60vh] overflow-y-auto"} px-4 pb-2`}>
                  {filtersUi}
                </div>
                <DrawerFooter>
                  <DrawerClose className="border border-border bg-background px-3 py-2 text-sm">Close</DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            {selectedFilterChips.length > 0 ? (
              <button
                type="button"
                onClick={clearAll}
                className="border border-border bg-background px-3 py-2 text-sm"
              >
                Clear all
              </button>
            ) : null}
          </div>

          {selectedFilterChips.length > 0 ? (
            <div className="flex flex-wrap justify-start gap-2">
              {selectedFilterChips.map(({ trait, value }) => (
                <button
                  key={`header-${trait}:${value}`}
                  type="button"
                  onClick={() => toggleFilter(trait, value, false)}
                  className="border border-border bg-[#f3ecdf] px-2 py-1 text-xs"
                >
                  {trait}: {value} x
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="min-w-0">
          {loading ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-3.5" />
              Loading physics...
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {!loading && !error ? (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={onlyListed}
                      onCheckedChange={(checked) => {
                        setVisibleCount(PAGE_SIZE);
                        setOnlyListed(checked === true);
                      }}
                      aria-label="Only show listed pendulums"
                    />
                    <span>Only show listed for sale</span>
                  </label>
                  <div
                    className={`h-9 min-w-[190px] ${
                      onlyListed ? "visible" : "pointer-events-none invisible"
                    }`}
                  >
                    <Combobox
                      value={listedPriceSort}
                      onValueChange={(value) => setListedPriceSort(value as ListedPriceSort)}
                    >
                      <ComboboxTrigger className="flex w-full items-center justify-between whitespace-nowrap border border-border bg-background px-3 py-2 text-sm">
                        {listedSortLabel}
                      </ComboboxTrigger>
                      <ComboboxContent>
                        <ComboboxList>
                          {LISTED_PRICE_SORT_OPTIONS.map((option) => (
                            <ComboboxItem key={option.value} value={option.value}>
                              {option.label}
                            </ComboboxItem>
                          ))}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>
                <p className="text-right text-sm text-muted-foreground">
                  Showing {filteredSorted.length} of {all.length}.
                </p>
              </div>
              {onlyListed && listingsLoading ? (
                <p className="mb-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <Spinner className="size-3" />
                  Checking listings...
                </p>
              ) : null}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-5">
                {visibleItems.map((item) => {
                  const listing = listingByTokenId[item.token_id];
                  const listingLabel =
                    listing?.isListed && listing.displayPrice ? `Listed · ${listing.displayPrice}` : "Listed";

                  return (
                    <button
                      key={item.token_id}
                      type="button"
                      onClick={() => setActiveItem(item)}
                      className="overflow-hidden border border-border bg-[#fffcf7] text-left shadow-[0_2px_5px_#0003] transition-transform hover:scale-[1.02]"
                    >
                      <img
                        src={item.image_uri}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="block aspect-square w-full bg-background object-cover"
                      />
                      <div className="grid gap-1 p-3">
                        <div className="grid gap-1">
                          <p className="text-sm">{item.name}</p>
                          {listing?.isListed ? (
                            <Badge
                              aria-label="Active OpenSea listing"
                              title={listingLabel}
                              className="w-fit border-green-700 bg-green-100 text-[10px] text-green-900"
                            >
                              {listingLabel}
                            </Badge>
                          ) : null}
                        </div>
                        {sort.startsWith("perfection_") ? (
                          <p className="text-xs text-muted-foreground">
                            Perfection Score: {item.perfection_score ?? "n/a"}
                          </p>
                        ) : null}
                        {sort.startsWith("cycle_") ? (
                          <p className="text-xs text-muted-foreground">Cycle Count: {item.cycle_count ?? "n/a"}</p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
          <div ref={sentinelRef} className="h-px w-full" />
      </div>

      <Dialog
        open={isGridDialogOpen}
        onOpenChange={(open) => {
          if (!open) finishGridDrag();
          setIsGridDialogOpen(open);
        }}
      >
        <DialogContent className="h-[94vh] w-[98vw] overflow-hidden border border-border bg-[#fffcf7] p-4 sm:h-[min(92vh,1000px)] sm:w-[min(92vh,1000px)] sm:max-w-[min(92vh,1000px)] sm:p-5">
          <div className="flex h-full min-w-0 flex-col gap-4 overflow-hidden">
            <div className="space-y-1">
              <DialogTitle className="text-lg">Generate my grid</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Enter your wallet address or ENS name to build a Pendulums grid from your OpenSea wallet holdings.
              </DialogDescription>
            </div>

            <form
              className="min-w-0 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
              onSubmit={(event) => {
                event.preventDefault();
                void fetchWalletPendulums();
              }}
            >
              <Input
                value={walletInput}
                onChange={(event) => setWalletInput(event.target.value)}
                placeholder="0x... or name.eth"
                className="w-full min-w-0 rounded-none border-border bg-background text-sm sm:min-w-[220px] sm:flex-1"
              />
              <Button
                type="submit"
                variant="outline"
                className="rounded-none px-4 text-sm whitespace-nowrap sm:flex-none sm:min-w-[170px]"
                disabled={walletFetchLoading}
              >
                {walletFetchLoading ? (
                  <>
                    <Spinner className="size-3.5" />
                    Fetching...
                  </>
                ) : (
                  "Fetch Pendulums"
                )}
              </Button>
            </form>

            {walletLookupError ? <p className="text-sm text-red-700">{walletLookupError}</p> : null}

            {activeWalletAddress ? (
              <div className="min-w-0 flex flex-wrap items-center gap-2 overflow-hidden">
                <p className="text-sm text-muted-foreground">
                  {orderedWalletItems.length} pendulum{orderedWalletItems.length === 1 ? "" : "s"} found. Grid:{" "}
                  {gridDimensions.columns} x {gridDimensions.rows}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-none px-2 text-xs"
                  onClick={() => setIsGridOrientationSwapped((current) => !current)}
                  disabled={!canSwapGridOrientation}
                  aria-label="Swap grid orientation"
                >
                  <ArrowLeftRight className="size-3" />
                  Swap
                </Button>
              </div>
            ) : null}

            {activeWalletAddress && orderedWalletItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No Pendulums found for this wallet in the current OpenSea response.
              </p>
            ) : null}

            {orderedWalletItems.length > 0 ? (
              <div className="flex min-h-0 flex-1 flex-col border border-border bg-background p-2">
                <p className="mb-2 text-xs text-muted-foreground"><strong>Drag to reorder tiles before export.</strong></p>
                <div
                  ref={gridPreviewFrameRef}
                  className={`min-h-0 flex-1 overflow-hidden ${isGridDragging ? "touch-none" : ""} flex items-center justify-center ${
                    isGridDragging ? "cursor-grabbing touch-none select-none" : ""
                  }`}
                >
                  {previewCellSize > 0 ? (
                    <div
                      className="grid"
                      style={{
                        width: `${previewCellSize * gridDimensions.columns + PREVIEW_GRID_GAP_PX * Math.max(0, gridDimensions.columns - 1)}px`,
                        height: `${previewCellSize * gridDimensions.rows + PREVIEW_GRID_GAP_PX * Math.max(0, gridDimensions.rows - 1)}px`,
                        gap: `${PREVIEW_GRID_GAP_PX}px`,
                        gridTemplateColumns: `repeat(${gridDimensions.columns}, ${previewCellSize}px)`,
                        gridTemplateRows: `repeat(${gridDimensions.rows}, ${previewCellSize}px)`,
                      }}
                    >
                      {orderedWalletItems.map((item, index) => (
                        <button
                          key={`wallet-grid-${item.token_id}`}
                          type="button"
                          data-grid-tile-index={index}
                          onPointerDown={(event) => {
                            if (event.button !== 0 && event.pointerType === "mouse") return;
                            event.preventDefault();
                            const rect = event.currentTarget.getBoundingClientRect();
                            dragPointerOffsetRef.current = {
                              x: event.clientX - rect.left,
                              y: event.clientY - rect.top,
                            };
                            dragTargetPositionRef.current = { x: event.clientX, y: event.clientY };
                            dragCurrentPositionRef.current = { x: event.clientX, y: event.clientY };
                            setDragGhostPosition({ x: event.clientX, y: event.clientY });
                            setIsGridDragging(true);
                            setDraggingTileIndex(index);
                          }}
                          className={`block overflow-hidden border border-border bg-[#f3ecdf] ${
                            draggingTileIndex === index ? "opacity-40 ring-2 ring-foreground/25" : ""
                          }`}
                          style={{ width: previewCellSize, height: previewCellSize }}
                          aria-label={`Reorder ${item.name}`}
                        >
                          <img
                            src={item.image_uri}
                            alt={item.name}
                            loading="eager"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            className="block h-full w-full object-cover"
                            draggable={false}
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {isGridDragging && draggingGridItem && dragGhostPosition && typeof document !== "undefined"
              ? createPortal(
                  <div
                    className="pointer-events-none fixed z-[80] overflow-hidden border border-border bg-[#f3ecdf] shadow-[0_8px_24px_#00000025]"
                    style={{
                      width: previewCellSize,
                      height: previewCellSize,
                      left: dragGhostPosition.x - dragPointerOffsetRef.current.x,
                      top: dragGhostPosition.y - dragPointerOffsetRef.current.y,
                    }}
                  >
                    <img
                      src={draggingGridItem.image_uri}
                      alt={draggingGridItem.name}
                      loading="eager"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="block h-full w-full object-cover"
                      draggable={false}
                    />
                  </div>,
                  document.body
                )
              : null}

            {gridExportError ? <p className="text-sm text-red-700">{gridExportError}</p> : null}

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => void downloadWalletGridPng()}
                disabled={orderedWalletItems.length === 0 || isExportingGrid}
                variant="outline"
                className="rounded-none text-sm"
              >
                {isExportingGrid ? (
                  <>
                    <Spinner className="size-3.5" />
                    Saving...
                  </>
                ) : (
                  "Save PNG (4K)"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(activeItem)}
        onOpenChange={(open) => {
          if (!open) {
            setActiveItem(null);
          }
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-h-[88vh] w-full max-w-6xl overflow-y-auto border border-border bg-[#fffcf7] p-4 shadow-[0_2px_5px_#0003] sm:max-w-6xl"
        >
          {activeItem ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-4">
                <DialogTitle className="text-lg">{activeItem.name}</DialogTitle>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="border border-border bg-background px-3 py-1 text-sm"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-[minmax(320px,1.1fr)_minmax(260px,0.9fr)]">
                <div className="space-y-3">
                  {activeItem.animation_url ? (
                    <div className="relative aspect-square min-h-[320px] w-full border border-border">
                      <iframe
                        src={activeItem.animation_url}
                        title={activeItem.name}
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-square min-h-[320px] w-full border border-border">
                      <img
                        src={activeItem.image_uri}
                        alt={activeItem.name}
                        referrerPolicy="no-referrer"
                        className="block h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <a
                    href={makeOpenSeaUrl(activeItem.token_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex border border-border bg-background px-3 py-2 text-sm"
                  >
                    View on OpenSea
                    {activeListing?.isListed && activeListing.displayPrice ? ` · ${activeListing.displayPrice}` : null}
                  </a>
                  <p className="text-sm leading-7 text-muted-foreground">{DESCRIPTION}</p>
                </div>

                <div className="space-y-2">
                  {activeItem.attributes.length === 0 ? (
                    <div className="border border-border bg-background px-3 py-2 text-sm">No attributes</div>
                  ) : (
                    activeItem.attributes.map((attr) => {
                      const trait = normalize(attr.trait_type);
                      const value = normalize(attr.value);
                      return (
                        <button
                          key={`${trait}:${value}`}
                          type="button"
                          onClick={() => applySingleAttributeFilter(trait, value)}
                          className="flex w-full items-center justify-between gap-4 border border-border bg-background px-3 py-2 text-left text-sm hover:bg-[#f3ecdf]"
                        >
                          <span className="text-muted-foreground">{trait}</span>
                          <span>{value}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
}
