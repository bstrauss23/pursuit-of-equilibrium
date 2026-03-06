"use client";

import Image from "next/image";
import { type SyntheticEvent, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import luxData from "../../../public/data/lux.json";

type LuxAttribute = {
  trait_type: string;
  value: string;
};

type LuxItem = {
  name: string;
  image: string;
  description?: string;
  attributes?: LuxAttribute[];
  image_details?: {
    width?: number;
    height?: number;
  };
  media?: {
    dimensions?: string;
  };
};
type LuxGridItem = LuxItem & { imageUrl: string; order: number };

const IPFS_PRIMARY_GATEWAY = "https://ipfs.io/ipfs/";
const IPFS_FALLBACK_GATEWAY = "https://dweb.link/ipfs/";

function toIpfsFallbackUrl(url: string): string | null {
  if (!url) return null;
  if (url.startsWith(IPFS_FALLBACK_GATEWAY)) return null;
  if (url.startsWith(IPFS_PRIMARY_GATEWAY)) {
    return url.replace(IPFS_PRIMARY_GATEWAY, IPFS_FALLBACK_GATEWAY);
  }
  if (url.startsWith("ipfs://")) {
    return `${IPFS_FALLBACK_GATEWAY}${url.replace("ipfs://", "")}`;
  }
  return null;
}

function resolveLuxImageUrl(item: LuxItem): string {
  if (item.name === "Lux No. 2") {
    return item.image;
  }

  if (item.image.startsWith("ipfs://")) {
    const cid = item.image.replace("ipfs://", "").split("/")[0];

    if (item.name === "Lux No. 1") {
      return `https://ipfs.io/ipfs/${cid}`;
    }

    return `https://ipfs.io/ipfs/${cid}/media`;
  }

  return item.image;
}

const luxItems = (luxData as LuxItem[])
  .slice(0, 7)
  .sort((a, b) => {
    const aNum = Number(a.name.match(/\d+/)?.[0] ?? Number.POSITIVE_INFINITY);
    const bNum = Number(b.name.match(/\d+/)?.[0] ?? Number.POSITIVE_INFINITY);
    return aNum - bNum;
  })
  .map((item, index) => ({ ...item, order: index + 1, imageUrl: resolveLuxImageUrl(item) })) satisfies LuxGridItem[];

function getImageDimensions(item: LuxItem): { width: number; height: number } {
  const detailsWidth = item.image_details?.width;
  const detailsHeight = item.image_details?.height;
  if (typeof detailsWidth === "number" && typeof detailsHeight === "number" && detailsWidth > 0 && detailsHeight > 0) {
    return { width: detailsWidth, height: detailsHeight };
  }

  const mediaDimensions = item.media?.dimensions;
  if (typeof mediaDimensions === "string") {
    const match = mediaDimensions.match(/^(\d+)x(\d+)$/i);
    if (match) {
      const width = Number(match[1]);
      const height = Number(match[2]);
      if (width > 0 && height > 0) {
        return { width, height };
      }
    }
  }

  return { width: 1200, height: 1200 };
}

function LuxGridImage({ item }: { item: LuxGridItem }) {
  const [src, setSrc] = useState(item.imageUrl);
  const [fallbackTried, setFallbackTried] = useState(false);
  const dimensions = getImageDimensions(item);

  function handleError(event: SyntheticEvent<HTMLImageElement>) {
    if (fallbackTried) return;

    const element = event.currentTarget;
    const fallbackUrl = toIpfsFallbackUrl(element.currentSrc || src);
    if (!fallbackUrl) return;

    setFallbackTried(true);
    setSrc(fallbackUrl);
  }

  return (
    <Image
      src={src}
      alt={item.name}
      width={dimensions.width}
      height={dimensions.height}
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      quality={65}
      loading="lazy"
      className="h-auto w-full"
      onError={handleError}
    />
  );
}

function LuxDrawerImage({ item }: { item: LuxGridItem }) {
  const [src, setSrc] = useState(item.imageUrl);
  const [fallbackTried, setFallbackTried] = useState(false);
  const dimensions = getImageDimensions(item);

  function handleError(event: SyntheticEvent<HTMLImageElement>) {
    if (fallbackTried) return;

    const element = event.currentTarget;
    const fallbackUrl = toIpfsFallbackUrl(element.currentSrc || src);
    if (!fallbackUrl) return;

    setFallbackTried(true);
    setSrc(fallbackUrl);
  }

  return (
    <Image
      src={src}
      alt={item.name}
      width={dimensions.width}
      height={dimensions.height}
      sizes="(max-width: 768px) 100vw, 50vw"
      quality={80}
      loading="eager"
      className="h-auto max-h-[45vh] w-auto max-w-full object-contain md:max-h-[70vh]"
      onError={handleError}
    />
  );
}

function LuxCard({
  item,
  onSelect,
}: {
  item: LuxGridItem;
  onSelect: (item: LuxGridItem) => void;
}) {
  return (
    <article data-lux-order={item.order} className="relative transition-transform duration-300 ease-out hover:scale-[1.015]">
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="group relative block w-full overflow-hidden rounded-md border border-zinc-700/40 bg-black/35 text-left"
        aria-label={`Open details for ${item.name}`}
      >
      <LuxGridImage item={item} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/38 group-hover:opacity-100 group-focus-within:bg-black/38 group-focus-within:opacity-100">
        <span className="text-center text-sm tracking-[0.24em] text-zinc-100 uppercase md:text-base">
          {item.name.toUpperCase()}
        </span>
      </div>
      </button>
    </article>
  );
}

function splitIntoColumns<T>(items: T[], columns: number): T[][] {
  const groups = Array.from({ length: columns }, () => [] as T[]);
  for (let index = 0; index < items.length; index += 1) {
    groups[index % columns].push(items[index]);
  }
  return groups;
}

export default function LuxPage() {
  const [activeItem, setActiveItem] = useState<LuxGridItem | null>(null);

  useEffect(() => {
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const luxBg = "#17181b";

    document.body.style.backgroundColor = luxBg;
    document.documentElement.style.backgroundColor = luxBg;

    return () => {
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.style.backgroundColor = prevHtmlBg;
    };
  }, []);

  function handleCardSelect(item: LuxGridItem) {
    setActiveItem(item);
  }

  return (
    <section className="relative -mx-4 -mt-8 -mb-8 min-h-[calc(100vh-4rem)] overflow-hidden md:-mx-6">
      <div className="absolute inset-0 bg-[#17181b]" />
      <div
        aria-hidden
        className="absolute inset-0 opacity-65"
        style={{
          background:
            "radial-gradient(120% 70% at 50% -10%, rgba(255,248,236,0.14) 0%, rgba(255,246,232,0.05) 30%, rgba(255,246,232,0.00) 62%), linear-gradient(180deg, rgba(5,5,7,0.97) 0%, rgba(12,12,14,0.95) 38%, rgba(20,20,22,0.97) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-24 left-1/2 h-[42vh] w-[min(1200px,95vw)] -translate-x-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,247,235,0.18) 0%, rgba(245,236,222,0.10) 34%, rgba(210,198,180,0.04) 56%, rgba(200,188,172,0) 74%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1700px] flex-col items-center px-4 pt-24 pb-16 md:px-8 md:pt-32 md:pb-24">
        <div className="mb-24 flex flex-col items-center gap-4 text-center md:mb-32 md:gap-6">
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm tracking-[0.2em] text-zinc-300 uppercase md:text-lg">Chapter 1</p>
            <h1 className="text-4xl tracking-[0.2em] text-zinc-100 md:text-8xl">LUX</h1>
          </div>
          <h2 className="text-lg tracking-[0.08em] text-zinc-200 md:text-2xl">
            Visualizing unseen motion through light.
          </h2>
          <h3 className="text-base tracking-[0.08em] text-zinc-300 md:text-lg">by BEN STRAUSS</h3>
        </div>

        <div className="w-full max-w-[1400px] md:hidden">
          <div className="space-y-4">
            {luxItems.map((item) => (
              <LuxCard
                key={`sm-${item.name}`}
                item={item}
                onSelect={handleCardSelect}
              />
            ))}
          </div>
        </div>

        <div className="hidden w-full max-w-[1400px] gap-5 md:flex xl:hidden">
          {splitIntoColumns(luxItems, 2).map((column, columnIndex) => (
            <div key={`md-col-${columnIndex}`} className="flex-1 space-y-5">
              {column.map((item) => (
                <LuxCard
                  key={`md-${item.name}`}
                  item={item}
                  onSelect={handleCardSelect}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="hidden w-full max-w-[1400px] gap-5 xl:flex">
          {splitIntoColumns(luxItems, 3).map((column, columnIndex) => (
            <div key={`xl-col-${columnIndex}`} className="flex-1 space-y-5">
              {column.map((item) => (
                <LuxCard
                  key={`xl-${item.name}`}
                  item={item}
                  onSelect={handleCardSelect}
                />
              ))}
            </div>
          ))}
        </div>

        <div aria-hidden className="my-[calc(var(--section-gap)/2)] w-full px-4 md:px-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-100/35 to-transparent" />
        </div>

        <div id="about" className="flex w-full items-center justify-center gap-4 md:gap-6">
          <span className="h-[2px] w-16 bg-gradient-to-r from-transparent to-zinc-100/45 md:w-60" />
          <h2 className="text-3xl text-zinc-100/90 md:text-5xl">About Lux</h2>
          <span className="h-[2px] w-16 bg-gradient-to-l from-transparent to-zinc-100/45 md:w-60" />
        </div>

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
            className="max-h-[90vh] w-full max-w-7xl overflow-hidden border border-zinc-700 bg-[#17181b] p-4 text-zinc-100 shadow-[0_4px_20px_#0008] sm:max-w-7xl"
          >
            {activeItem ? (
              <>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <DialogTitle className="text-xl tracking-[0.16em] text-zinc-100 uppercase md:text-2xl">
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

                <div className="grid gap-4 md:h-[72vh] md:grid-cols-2 md:items-stretch md:gap-6">
                  <div className="flex h-full items-center justify-center overflow-hidden rounded-md border border-zinc-700/70 bg-black/35 p-2">
                    <LuxDrawerImage item={activeItem} />
                  </div>

                  <div className="flex h-full min-h-0 flex-col">
                    <DialogDescription className="mb-4 text-sm leading-7 text-zinc-300 md:text-base">
                      {activeItem.description ?? "No description available."}
                    </DialogDescription>

                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                      <h4 className="mb-3 text-xs tracking-[0.2em] text-zinc-400 uppercase">Attributes</h4>
                      {activeItem.attributes && activeItem.attributes.length > 0 ? (
                        activeItem.attributes.map((attribute) => (
                          <div
                            key={`${activeItem.name}-${attribute.trait_type}-${attribute.value}`}
                            className="flex items-center justify-between gap-4 rounded-md border border-zinc-700/70 bg-zinc-900/50 px-3 py-2"
                          >
                            <span className="text-xs tracking-[0.08em] text-zinc-400 uppercase">
                              {attribute.trait_type}
                            </span>
                            <span className="text-sm text-zinc-200">{attribute.value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="pb-2 text-sm text-zinc-400">No attributes listed.</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
