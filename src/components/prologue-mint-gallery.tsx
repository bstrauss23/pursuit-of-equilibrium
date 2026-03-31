"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { PrologueMintMockup, type MinterEntry } from "@/components/prologue-mint-mockup";

type GenesisArtwork = {
  id: number;
  title: string;
  subtitle: string;
  src: string;
  initialMinters: MinterEntry[];
};

const ORIGINAL_SUPPLY = 100;
const MIN_MINT_ETH = 0.01;

const GENESIS_ARTWORKS: GenesisArtwork[] = [
  {
    id: 1,
    title: "Genesis I",
    subtitle: "Prologue: First Contact",
    src: "/genesis-art/genesis-1.jpeg",
    initialMinters: [
      { wallet: "0xA91f...3E2b", contribution: 0.05 },
      { wallet: "0x73cd...9a10", contribution: 0.04 },
      { wallet: "0x4b2E...8Fa1", contribution: 0.04 },
      { wallet: "0xDe14...0c99", contribution: 0.03 },
      { wallet: "0x91a0...7bF3", contribution: 0.03 },
      { wallet: "0x66E3...2D11", contribution: 0.03 },
      { wallet: "0xBf09...aC45", contribution: 0.03 },
      { wallet: "0x5c81...dE77", contribution: 0.02 },
      { wallet: "0x2Ef4...19b0", contribution: 0.02 },
      { wallet: "0xF023...88Ad", contribution: 0.01 },
      { wallet: "0x77dA...4C20", contribution: 0.01 },
      { wallet: "0x118e...d901", contribution: 0.01 },
    ],
  },
  {
    id: 2,
    title: "Genesis II",
    subtitle: "Prologue: First Contact",
    src: "/genesis-art/genesis-2.jpeg",
    initialMinters: [
      { wallet: "0xF1a2...901b", contribution: 0.04 },
      { wallet: "0x8c77...AA14", contribution: 0.03 },
      { wallet: "0x2B19...44fe", contribution: 0.03 },
      { wallet: "0x3a4D...7Cc1", contribution: 0.02 },
      { wallet: "0x12b0...D2e8", contribution: 0.02 },
      { wallet: "0x94Ef...8B90", contribution: 0.02 },
      { wallet: "0x7f10...4A2d", contribution: 0.02 },
      { wallet: "0x5C55...a014", contribution: 0.02 },
      { wallet: "0x0ab4...f9D2", contribution: 0.01 },
    ],
  },
  {
    id: 3,
    title: "Genesis III",
    subtitle: "Prologue: First Contact",
    src: "/genesis-art/genesis-3.jpeg",
    initialMinters: [
      { wallet: "0xAA11...0F12", contribution: 0.02 },
      { wallet: "0xD2c4...1bA1", contribution: 0.03 },
      { wallet: "0x18eF...B920", contribution: 0.6 },
    ],
  },
  {
    id: 4,
    title: "Genesis IV",
    subtitle: "Prologue: First Contact",
    src: "/genesis-art/genesis-4.jpeg",
    initialMinters: [
      { wallet: "0x1eD0...0af2", contribution: 0.03 },
      { wallet: "0x90bC...EE12", contribution: 0.03 },
      { wallet: "0x34a1...f3c8", contribution: 0.02 },
      { wallet: "0xD91f...6A0b", contribution: 0.02 },
      { wallet: "0x1177...4F2d", contribution: 0.02 },
      { wallet: "0xA001...d3E4", contribution: 0.02 },
      { wallet: "0x3B66...1b90", contribution: 0.01 },
    ],
  },
  {
    id: 5,
    title: "Genesis V",
    subtitle: "Prologue: First Contact",
    src: "/genesis-art/genesis-5.jpeg",
    initialMinters: [
      { wallet: "0x4D41...ab10", contribution: 0.05 },
      { wallet: "0x91e2...0C7a", contribution: 0.05 },
      { wallet: "0xB10f...F023", contribution: 0.04 },
      { wallet: "0x6eD4...D311", contribution: 0.04 },
      { wallet: "0x2a77...0e19", contribution: 0.04 },
      { wallet: "0x5C8e...44a1", contribution: 0.04 },
      { wallet: "0x9b2f...ab99", contribution: 0.04 },
      { wallet: "0x0011...89ed", contribution: 0.03 },
      { wallet: "0x7f1e...cc22", contribution: 0.03 },
      { wallet: "0x3341...A911", contribution: 0.03 },
      { wallet: "0xA2c0...9211", contribution: 0.03 },
      { wallet: "0xDB91...00a0", contribution: 0.03 },
      { wallet: "0x4f77...c102", contribution: 0.03 },
      { wallet: "0x6a00...2eF4", contribution: 0.03 },
      { wallet: "0xBbe0...1190", contribution: 0.03 },
      { wallet: "0x11ff...e901", contribution: 0.03 },
      { wallet: "0x7201...b442", contribution: 0.02 },
      { wallet: "0x4444...1f10", contribution: 0.02 },
      { wallet: "0x7D19...a0B0", contribution: 0.02 },
      { wallet: "0x0098...8e71", contribution: 0.02 },
    ],
  },
  {
    id: 6,
    title: "Genesis VI",
    subtitle: "Prologue: First Contact",
    src: "/genesis-art/genesis-6.jpeg",
    initialMinters: [
      { wallet: "0x9f0A...cb10", contribution: 0.03 },
      { wallet: "0x28E4...77f1", contribution: 0.02 },
      { wallet: "0xFAb1...33c0", contribution: 0.02 },
      { wallet: "0x11eE...00D4", contribution: 0.01 },
      { wallet: "0x2cB7...9001", contribution: 0.01 },
    ],
  },
];

function mintedStatForCard(minters: MinterEntry[]): { minted: number; maxTotalPossible: number } {
  const minted = minters.length;
  const totalVolume = minters.reduce((sum, entry) => sum + entry.contribution, 0);
  const totalRemoved = Math.max(0, Math.round(totalVolume / MIN_MINT_ETH) - minted);
  const maxTotalPossible = Math.max(0, ORIGINAL_SUPPLY - totalRemoved);
  return { minted, maxTotalPossible };
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
          {GENESIS_ARTWORKS.map((artwork) => (
            (() => {
              const mintedStat = mintedStatForCard(artwork.initialMinters);
              return (
                <button
                  key={artwork.id}
                  type="button"
                  onClick={() => setSelectedArtworkId(artwork.id)}
                  className="group overflow-hidden rounded-md border border-zinc-700/70 bg-black/45 text-left shadow-[0_14px_30px_rgba(0,0,0,0.35)]"
                >
                  <div className="aspect-square overflow-hidden bg-black/35 p-4">
                    <Image
                      src={artwork.src}
                      alt={artwork.title}
                      width={1024}
                      height={1024}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex items-center justify-between border-t border-zinc-700/70 px-3 py-2">
                    <p className="text-base font-semibold text-zinc-100">{artwork.title}</p>
                    <p className="text-sm text-zinc-300">
                      Minted:{" "}
                      <span className="font-semibold text-zinc-100">
                        {mintedStat.minted}/{mintedStat.maxTotalPossible}
                      </span>
                    </p>
                  </div>
                </button>
              );
            })()
          ))}
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
          className="w-[min(1400px,96vw)] max-h-[92vh] overflow-hidden border border-zinc-700 bg-[#17181b] p-4 text-zinc-100 shadow-[0_18px_60px_rgba(0,0,0,0.6)] md:p-6"
        >
          {selectedArtwork ? (
            <>
              <DialogTitle className="sr-only">{selectedArtwork.title}</DialogTitle>
              <PrologueMintMockup
                key={selectedArtwork.id}
                artworkSrc={selectedArtwork.src}
                artworkTitle={selectedArtwork.title}
                artworkSubtitle={selectedArtwork.subtitle}
                initialMinters={selectedArtwork.initialMinters}
              />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
