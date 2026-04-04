"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SplitMintMockup } from "@/components/split-mint-mockup";

type GenesisArtwork = {
  id: number;
  title: string;
  subtitle: string;
  src: string;
  initialPhaseNumber: number;
  initialCommittedCollectors: number;
};

const PHASE_SUPPLIES = [1, 2, 4, 8, 16, 32, 64] as const;

const GENESIS_ARTWORKS: GenesisArtwork[] = [
  {
    id: 1,
    title: "Primus No. 1",
    subtitle: "PROLOGUE",
    src: "/first-contact/first-contact-1.jpg",
    initialPhaseNumber: 1,
    initialCommittedCollectors: 0,
  },
  {
    id: 2,
    title: "Primus No. 2",
    subtitle: "PROLOGUE",
    src: "/first-contact/first-contact-2.jpg",
    initialPhaseNumber: 2,
    initialCommittedCollectors: 0,
  },
  {
    id: 3,
    title: "Primus No. 3",
    subtitle: "PROLOGUE",
    src: "/first-contact/first-contact-3.jpg",
    initialPhaseNumber: 3,
    initialCommittedCollectors: 2,
  },
  {
    id: 4,
    title: "Primus No. 4",
    subtitle: "PROLOGUE",
    src: "/first-contact/first-contact-4.jpg",
    initialPhaseNumber: 4,
    initialCommittedCollectors: 3,
  },
  {
    id: 5,
    title: "Primus No. 5",
    subtitle: "PROLOGUE",
    src: "/first-contact/first-contact-5.jpg",
    initialPhaseNumber: 5,
    initialCommittedCollectors: 7,
  },
  {
    id: 6,
    title: "Primus No. 6",
    subtitle: "PROLOGUE",
    src: "/first-contact/first-contact-6.jpg",
    initialPhaseNumber: 6,
    initialCommittedCollectors: 16,
  },
];

function mintedStatForCard(phaseNumber: number, committedCollectors: number): { minted: number; supply: number } {
  const phaseIndex = Math.max(0, Math.min(PHASE_SUPPLIES.length - 1, phaseNumber - 1));
  const supply = PHASE_SUPPLIES[phaseIndex] ?? 1;
  const minted = Math.min(Math.max(0, committedCollectors), supply);
  return { minted, supply };
}

export function PrologueMintGallery() {
  const [selectedArtworkId, setSelectedArtworkId] = useState<number | null>(null);

  const selectedArtwork = useMemo(
    () => GENESIS_ARTWORKS.find((artwork) => artwork.id === selectedArtworkId) ?? null,
    [selectedArtworkId],
  );

  return (
    <>
      <section className="mx-auto w-full max-w-[1240px] px-4 md:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GENESIS_ARTWORKS.map((artwork) => {
            const mintedStat = mintedStatForCard(artwork.initialPhaseNumber, artwork.initialCommittedCollectors);
            return (
              <button
                key={artwork.id}
                type="button"
                onClick={() => setSelectedArtworkId(artwork.id)}
                className="group overflow-hidden rounded-md border border-zinc-700/70 bg-black/45 text-left shadow-[0_14px_30px_rgba(0,0,0,0.35)]"
              >
                <div className="border-b border-zinc-700/70 px-3 py-2">
                  <p className="font-mono text-base font-semibold text-zinc-100">{artwork.title}</p>
                </div>
                <div className="aspect-square overflow-hidden bg-black/35">
                  <Image
                    src={artwork.src}
                    alt={artwork.title}
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="border-t border-zinc-700/70 px-3 py-2">
                  <p className="flex items-center justify-between gap-3 text-sm text-zinc-300">
                    <span>Phase {artwork.initialPhaseNumber}</span>
                    <span>
                      Minted: <span className="font-semibold text-zinc-100">{mintedStat.minted}/{mintedStat.supply}</span>
                    </span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <Dialog
        open={Boolean(selectedArtwork)}
        onOpenChange={(open) => {
          if (!open) setSelectedArtworkId(null);
        }}
      >
        <DialogContent
          size="auto"
          showCloseButton
          className="w-[min(1600px,96vw)] max-h-[92vh] overflow-y-auto md:overflow-hidden border border-zinc-700 bg-[#17181b] p-4 text-zinc-100 shadow-[0_18px_60px_rgba(0,0,0,0.6)] md:p-6"
        >
          {selectedArtwork ? (
            <>
              <DialogTitle className="sr-only">{selectedArtwork.title}</DialogTitle>
              <SplitMintMockup
                key={selectedArtwork.id}
                artworkSrc={selectedArtwork.src}
                artworkTitle={selectedArtwork.title}
                artworkSubtitle={selectedArtwork.subtitle}
                initialPhaseNumber={selectedArtwork.initialPhaseNumber}
                initialCommittedCollectors={selectedArtwork.initialCommittedCollectors}
                initialTimeRemainingSeconds={26 * 60}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
