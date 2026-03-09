"use client";

import { type SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import NextImage from "next/image";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
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

type RawSeekerItem = {
  token_id: number | string;
  name?: string;
  description?: string;
  image_uri?: string;
  animation_url?: string | null;
  attributes?: Attribute[];
};

type SeekerItem = {
  token_id: number;
  name: string;
  description: string;
  image_uri: string;
  animation_url: string | null;
  attributes: Attribute[];
  attrMap: Map<string, string>;
};

type SortMode = "token_asc" | "token_desc";
type ListedPriceSort = "price_desc" | "price_asc";

type ListingInfo = {
  isListed: boolean;
  rawPrice: string | null;
  displayPrice: string | null;
  currency: string | null;
  ownerAddress: string | null;
  fetchedAt: string;
};

const PAGE_SIZE = 60;
const IPFS_PRIMARY_GATEWAY = "https://ipfs.io/ipfs/";
const IPFS_FALLBACK_GATEWAY = "https://dweb.link/ipfs/";
const SEEKERS_CONTRACT = "0x44d504fb4b2aca2c17a9bc5e56dd002f6032333f";

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "token_asc", label: "Token id, low to high" },
  { value: "token_desc", label: "Token id, high to low" },
];

const LISTED_PRICE_SORT_OPTIONS: Array<{ value: ListedPriceSort; label: string }> = [
  { value: "price_desc", label: "Price: High to low" },
  { value: "price_asc", label: "Price: Low to high" },
];

function normalize(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeIpfsUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("ipfs://")) {
    return `${IPFS_PRIMARY_GATEWAY}${trimmed.replace("ipfs://", "")}`;
  }
  return trimmed;
}

function toIpfsFallbackUrl(url: string): string | null {
  if (!url) return null;
  if (url.startsWith(IPFS_FALLBACK_GATEWAY)) return null;
  if (url.startsWith(IPFS_PRIMARY_GATEWAY)) {
    return url.replace(IPFS_PRIMARY_GATEWAY, IPFS_FALLBACK_GATEWAY);
  }
  return null;
}

function handleIpfsImageError(event: SyntheticEvent<HTMLImageElement>) {
  const element = event.currentTarget;
  if (element.dataset.ipfsFallbackTried === "true") return;
  const fallbackUrl = toIpfsFallbackUrl(element.currentSrc || element.src);
  if (!fallbackUrl) return;
  element.dataset.ipfsFallbackTried = "true";
  element.src = fallbackUrl;
}

function handleIpfsIframeError(event: SyntheticEvent<HTMLIFrameElement>) {
  const element = event.currentTarget;
  if (element.dataset.ipfsFallbackTried === "true") return;
  const fallbackUrl = toIpfsFallbackUrl(element.src);
  if (!fallbackUrl) return;
  element.dataset.ipfsFallbackTried = "true";
  element.src = fallbackUrl;
}

function matchesFilters(item: SeekerItem, query: string, selected: Map<string, Set<string>>) {
  if (query) {
    const name = item.name.toLowerCase();
    const token = String(item.token_id);
    if (!name.includes(query) && !token.includes(query)) return false;
  }
  if (selected.size === 0) return true;
  for (const [trait, values] of selected.entries()) {
    const value = item.attrMap.get(trait);
    if (!value || !values.has(value)) return false;
  }
  return true;
}

function makeOpenSeaUrl(tokenId: number) {
  return `https://opensea.io/assets/ethereum/${SEEKERS_CONTRACT}/${tokenId}`;
}

export function SeekersGallery() {
  const [all, setAll] = useState<SeekerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortMode>("token_asc");
  const [selected, setSelected] = useState<Map<string, Set<string>>>(new Map());
  const [onlyListed, setOnlyListed] = useState(false);
  const [listedPriceSort, setListedPriceSort] = useState<ListedPriceSort>("price_asc");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeItem, setActiveItem] = useState<SeekerItem | null>(null);
  const [listingByTokenId, setListingByTokenId] = useState<Record<number, ListingInfo>>({});
  const [listingsLoading, setListingsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const query = search.trim().toLowerCase();
  const listedSortLabel =
    LISTED_PRICE_SORT_OPTIONS.find((option) => option.value === listedPriceSort)?.label ?? "Sort by price";
  const activeListing = activeItem ? listingByTokenId[activeItem.token_id] ?? null : null;

  useEffect(() => {
    let isMounted = true;
    fetch("/data/seekers_1-48.json", { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load metadata: ${response.status}`);
        return response.json();
      })
      .then((data: RawSeekerItem[]) => {
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
              name: normalize(item.name) || `Seeker #${item.token_id}`,
              description: normalize(item.description),
              image_uri: normalizeIpfsUrl(item.image_uri) ?? "",
              animation_url: normalizeIpfsUrl(item.animation_url),
              attributes,
              attrMap,
            } satisfies SeekerItem;
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
    return () => { isMounted = false; };
  }, []);

  const filterData = useMemo(() => {
    const typeValueCounts = new Map<string, Map<string, number>>();
    for (const item of all) {
      for (const attr of item.attributes) {
        const trait = normalize(attr.trait_type);
        const value = normalize(attr.value);
        if (!trait) continue;
        if (!typeValueCounts.has(trait)) typeValueCounts.set(trait, new Map());
        const valueCounts = typeValueCounts.get(trait)!;
        valueCounts.set(value, (valueCounts.get(value) ?? 0) + 1);
      }
    }
    const traitTypes = Array.from(typeValueCounts.keys()).sort((a, b) => a.localeCompare(b));
    return { traitTypes, typeValueCounts };
  }, [all]);

  const baseFilteredSorted = useMemo(() => {
    const filtered = all.filter((item) => matchesFilters(item, query, selected));
    if (sort === "token_desc") return filtered.slice().sort((a, b) => b.token_id - a.token_id);
    return filtered.slice().sort((a, b) => a.token_id - b.token_id);
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

  const visibleItems = useMemo(() => filteredSorted.slice(0, visibleCount), [filteredSorted, visibleCount]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (visibleCount >= filteredSorted.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filteredSorted.length));
        }
      },
      { rootMargin: "1200px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [filteredSorted.length, visibleCount]);

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

  const fetchListings = useCallback(async (signal?: AbortSignal) => {
    setListingsLoading(true);
    try {
      const response = await fetch("/api/listings/status?collection=seekers", {
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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    const raf = window.requestAnimationFrame(update);
    mq.addEventListener("change", update);
    return () => {
      window.cancelAnimationFrame(raf);
      mq.removeEventListener("change", update);
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
    setListedPriceSort("price_asc");
  }

  const selectedFilterChips = Array.from(selected.entries()).flatMap(([trait, values]) =>
    Array.from(values).map((value) => ({ trait, value }))
  );

  const filtersUi = (
    <>
      <input
        value={search}
        onChange={(event) => {
          setVisibleCount(PAGE_SIZE);
          setSearch(event.target.value);
        }}
        placeholder="Search name or token id"
        className="mb-3 w-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 outline-none placeholder:text-zinc-500"
      />
      <div className="mb-3 flex gap-2">
        <select
          value={sort}
          onChange={(event) => {
            setVisibleCount(PAGE_SIZE);
            setSort(event.target.value as SortMode);
          }}
          className="w-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={clearAll}
          className="border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
        >
          Clear
        </button>
      </div>
      <div className="space-y-2">
        {filterData.traitTypes.map((trait) => {
          const values = Array.from(filterData.typeValueCounts.get(trait)?.entries() ?? [])
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => a.count - b.count || a.value.localeCompare(b.value));
          return (
            <details key={trait} className="border border-zinc-700 bg-zinc-900 px-3 py-2">
              <summary className="cursor-pointer text-sm text-zinc-300">{trait}</summary>
              <div className="mt-2 flex flex-wrap gap-2">
                {values.map(({ value, count }) => {
                  const checked = selected.get(trait)?.has(value) ?? false;
                  return (
                    <label
                      key={`${trait}:${value}`}
                      className="inline-flex cursor-pointer items-center gap-2 border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
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
      <div className="mb-12 flex items-center justify-center gap-4 md:mb-16 md:gap-6">
        <span className="h-[2px] w-16 bg-gradient-to-r from-transparent to-zinc-100/45 md:w-60" />
        <h1 className="text-3xl text-zinc-100/90 md:text-5xl">The Seeker&apos;s Collection</h1>
        <span className="h-[2px] w-16 bg-gradient-to-l from-transparent to-zinc-100/45 md:w-60" />
      </div>

      <p className="mb-10 text-base leading-8 text-zinc-300 md:text-lg">
        The Seeker&apos;s Collection consists of special edition artworks distributed to every unique bidder
        across four Lux auctions. Each piece is a bidder&apos;s edition tied to a specific Lux work, forming
        a companion collection that rewards participation and curiosity. Four editions were released:
        Tempus, Motu, Clepsydra, and Kinesis.
      </p>

      <div className="mb-6 flex items-center gap-2">
        <Drawer open={isFiltersOpen} onOpenChange={setIsFiltersOpen} direction={isDesktop ? "left" : "bottom"}>
          <button
            type="button"
            className="border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
            onClick={() => setIsFiltersOpen(true)}
          >
            Filters
          </button>
          <DrawerContent className={`bg-[#17181b] ${isDesktop ? "h-full w-[360px] max-w-none" : ""}`}>
            <DrawerHeader>
              <DrawerTitle className="text-zinc-100">Filters</DrawerTitle>
              <DrawerDescription className="text-zinc-400">Search, sort, and refine seeker editions.</DrawerDescription>
            </DrawerHeader>
            <div className={`${isDesktop ? "h-full overflow-y-auto" : "max-h-[60vh] overflow-y-auto"} px-4 pb-2`}>
              {filtersUi}
            </div>
            <DrawerFooter>
              <DrawerClose className="border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200">
                Close
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        {selectedFilterChips.length > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {selectedFilterChips.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedFilterChips.map(({ trait, value }) => (
            <button
              key={`chip-${trait}:${value}`}
              type="button"
              onClick={() => toggleFilter(trait, value, false)}
              className="border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
            >
              {trait}: {value} ×
            </button>
          ))}
        </div>
      ) : null}

      <div className="min-w-0">
        {loading ? (
          <p className="text-sm text-zinc-400">Loading...</p>
        ) : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {!loading && !error ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-zinc-200">
                  <Switch
                    checked={onlyListed}
                    onCheckedChange={(checked) => {
                      setVisibleCount(PAGE_SIZE);
                      setOnlyListed(checked === true);
                    }}
                    className="border-zinc-600 data-[state=unchecked]:bg-zinc-700 data-[state=checked]:bg-zinc-400 hover:data-[state=unchecked]:bg-zinc-700/95 hover:data-[state=checked]:bg-zinc-400/95 [&_[data-slot=switch-thumb]]:bg-zinc-900 data-[state=checked]:[&_[data-slot=switch-thumb]]:bg-zinc-950"
                    aria-label="Only show listed seekers"
                  />
                  <span>Only show listed for sale</span>
                </label>
                <div className={`h-9 min-w-[190px] ${onlyListed ? "visible" : "pointer-events-none invisible"}`}>
                  <Combobox
                    value={listedPriceSort}
                    onValueChange={(value) => setListedPriceSort(value as ListedPriceSort)}
                  >
                    <ComboboxTrigger className="flex w-full items-center justify-between whitespace-nowrap border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200">
                      {listedSortLabel}
                    </ComboboxTrigger>
                    <ComboboxContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
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
              <p className="text-right text-sm text-zinc-500">
                Showing {filteredSorted.length} of {all.length}.
              </p>
            </div>
            {onlyListed && listingsLoading ? (
              <p className="mb-4 inline-flex items-center gap-2 text-xs text-zinc-400">
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
                    className="overflow-hidden border border-zinc-700/40 bg-zinc-900 text-left transition-transform hover:scale-[1.02] hover:border-zinc-600"
                  >
                    <div className="relative aspect-square w-full bg-zinc-900">
                      <NextImage
                        src={item.image_uri}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="grid gap-1 bg-zinc-900 p-3">
                      <p className="text-sm text-zinc-200">{item.name}</p>
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
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
        <div ref={sentinelRef} className="h-px w-full" />
      </div>

      <Dialog
        open={Boolean(activeItem)}
        onOpenChange={(open) => {
          if (!open) setActiveItem(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] w-full max-w-5xl overflow-y-auto border border-zinc-700 bg-[#17181b] p-4 text-zinc-100 shadow-[0_4px_20px_#0008] sm:max-w-5xl"
        >
          {activeItem ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-4">
                <DialogTitle className="text-xl tracking-[0.1em] text-zinc-100">
                  {activeItem.name}
                </DialogTitle>
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="rounded-md border border-zinc-600 bg-zinc-800/70 px-3 py-1 text-sm text-zinc-100 transition-colors hover:bg-zinc-700/80"
                >
                  Close
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-3">
                  {activeItem.animation_url ? (
                    <div className="relative aspect-square w-full border border-zinc-700">
                      <iframe
                        src={activeItem.animation_url}
                        title={activeItem.name}
                        onError={handleIpfsIframeError}
                        className="absolute inset-0 h-full w-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-square w-full border border-zinc-700">
                      <img
                        src={activeItem.image_uri}
                        alt={activeItem.name}
                        referrerPolicy="no-referrer"
                        onError={handleIpfsImageError}
                        className="block h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <a
                    href={makeOpenSeaUrl(activeItem.token_id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                  >
                    View on OpenSea
                    {activeListing?.isListed && activeListing.displayPrice ? ` · ${activeListing.displayPrice}` : null}
                  </a>
                  <DialogDescription className="whitespace-pre-line text-sm leading-7 text-zinc-400">
                    {activeItem.description || "No description available."}
                  </DialogDescription>
                </div>

                <div className="space-y-2">
                  {activeItem.attributes.length === 0 ? (
                    <div className="border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-400">
                      No attributes
                    </div>
                  ) : (
                    activeItem.attributes.map((attr) => (
                      <div
                        key={`${attr.trait_type}:${attr.value}`}
                        className="flex items-center justify-between gap-4 rounded-md border border-zinc-700/70 bg-zinc-900/50 px-3 py-2"
                      >
                        <span className="text-xs tracking-[0.08em] text-zinc-400 uppercase">{attr.trait_type}</span>
                        <span className="text-sm text-zinc-200">{attr.value}</span>
                      </div>
                    ))
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
