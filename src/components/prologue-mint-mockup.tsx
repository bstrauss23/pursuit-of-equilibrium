"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const TARGET_ETH = 1;
const MIN_MINT_ETH = 0.01;
const CONTRIBUTION_STEP = 0.01;
const INITIAL_MAX_SUPPLY = 100;

export type MinterPayment = {
  wallet: string;
  contribution: number;
};

function generateMockWallet(): string {
  const chars = "0123456789abcdef";
  let hex = "";
  for (let i = 0; i < 8; i += 1) {
    hex += chars[Math.floor(Math.random() * chars.length)];
  }
  return `0x${hex.slice(0, 4)}...${hex.slice(4)}`;
}

function editionsRemovedForContribution(contribution: number): number {
  return Math.max(0, Math.round(contribution / MIN_MINT_ETH) - 1);
}

function totalRemovedFromVolumeAndMints(totalVolumeEth: number, mintedCount: number): number {
  return Math.max(0, Math.round(totalVolumeEth / MIN_MINT_ETH) - mintedCount);
}

function clampContribution(value: number, maxValue: number): number {
  return Math.min(Math.max(value, MIN_MINT_ETH), maxValue);
}

function editionLabel(count: number): string {
  return count === 1 ? "edition" : "editions";
}

function interpolateColor(start: [number, number, number], end: [number, number, number], t: number): [number, number, number] {
  return [
    Math.round(start[0] + (end[0] - start[0]) * t),
    Math.round(start[1] + (end[1] - start[1]) * t),
    Math.round(start[2] + (end[2] - start[2]) * t),
  ];
}

function reductionAccentColor(progress: number): string {
  const p = Math.min(1, Math.max(0, progress));
  const stops: [number, number, number][] = [
    [245, 245, 245], // white
    [253, 230, 138], // yellow
    [251, 146, 60],  // orange
    [239, 68, 68],   // red
  ];

  if (p <= 1 / 3) {
    const [r, g, b] = interpolateColor(stops[0], stops[1], p * 3);
    return `rgb(${r}, ${g}, ${b})`;
  }
  if (p <= 2 / 3) {
    const [r, g, b] = interpolateColor(stops[1], stops[2], (p - 1 / 3) * 3);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const [r, g, b] = interpolateColor(stops[2], stops[3], (p - 2 / 3) * 3);
  return `rgb(${r}, ${g}, ${b})`;
}

type PrologueMintMockupProps = {
  artworkSrc: string;
  artworkTitle: string;
  artworkSubtitle: string;
  initialMinters: MinterPayment[];
};

export function PrologueMintMockup({
  artworkSrc,
  artworkTitle,
  artworkSubtitle,
  initialMinters,
}: PrologueMintMockupProps) {
  const [contribution, setContribution] = useState(0.01);
  const [isSimulating, setIsSimulating] = useState(false);
  const [minters, setMinters] = useState<MinterPayment[]>(() =>
    [...initialMinters].sort((a, b) => b.contribution - a.contribution),
  );
  const [isMinterDialogOpen, setIsMinterDialogOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const totalContributed = useMemo(
    () => minters.reduce((sum, minter) => sum + minter.contribution, 0),
    [minters],
  );
  const actualEditionsMinted = minters.length;
  const totalRemoved = useMemo(
    () => totalRemovedFromVolumeAndMints(totalContributed, actualEditionsMinted),
    [actualEditionsMinted, totalContributed],
  );
  const currentMaxTotalPossibleSupply = Math.max(0, INITIAL_MAX_SUPPLY - totalRemoved);
  const minMaxTotalPossibleAfterMint = actualEditionsMinted + 1;
  const remainingContribution = Math.max(0, Number((TARGET_ETH - totalContributed).toFixed(2)));
  const maxReducibleByEntry = Math.max(
    0,
    currentMaxTotalPossibleSupply - minMaxTotalPossibleAfterMint,
  );
  const maxContributionBySupplyFloor = Math.max(
    0,
    Number(((maxReducibleByEntry + 1) * MIN_MINT_ETH).toFixed(2)),
  );
  const rawMaxContribution = Math.min(remainingContribution, maxContributionBySupplyFloor);
  const controlMaxContribution = Math.max(MIN_MINT_ETH, rawMaxContribution);
  const effectiveContribution = Math.min(contribution, controlMaxContribution);
  const supplyRemoved = editionsRemovedForContribution(effectiveContribution);
  const simulatedMaxTotalPossibleSupply = Math.max(
    minMaxTotalPossibleAfterMint,
    currentMaxTotalPossibleSupply - supplyRemoved,
  );
  const mintProgressPct = (totalContributed / TARGET_ETH) * 100;
  const mintedCollectors = minters.length;
  const largestContribution = minters.reduce(
    (max, minter) => (minter.contribution > max ? minter.contribution : max),
    0,
  );
  const canMint =
    remainingContribution >= MIN_MINT_ETH &&
    rawMaxContribution >= MIN_MINT_ETH;
  const projectedMintedSupply = canMint ? actualEditionsMinted + 1 : actualEditionsMinted;
  const reductionProgress =
    maxReducibleByEntry > 0 ? supplyRemoved / maxReducibleByEntry : 0;
  const impactAccentColor = reductionAccentColor(reductionProgress);
  const sliderFillPct =
    controlMaxContribution > MIN_MINT_ETH
      ? ((effectiveContribution - MIN_MINT_ETH) / (controlMaxContribution - MIN_MINT_ETH)) * 100
      : 100;

  function runSimulation() {
    if (isSimulating || !canMint) return;

    setIsSimulating(true);
    const submittedContribution = Number(effectiveContribution.toFixed(2));

    timerRef.current = window.setTimeout(() => {
      setIsSimulating(false);
      setMinters((prev) =>
        [
          ...prev,
          {
            wallet: generateMockWallet(),
            contribution: submittedContribution,
          },
        ].sort((a, b) => b.contribution - a.contribution),
      );
      setContribution(MIN_MINT_ETH);
      timerRef.current = null;
    }, 1300);
  }

  return (
    <>

      <div className="mx-auto grid w-full max-w-[1240px] items-stretch gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="mx-auto aspect-square w-full max-w-[520px] overflow-hidden rounded-sm border border-zinc-800/80 bg-zinc-950 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <Image
              src={artworkSrc}
              alt="Prologue artwork"
              width={896}
              height={1344}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <div className="rounded-sm border border-zinc-800/80 bg-zinc-950 p-5 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:p-6">
            <h2 className="text-4xl leading-none text-zinc-100">{artworkTitle}</h2>
            <p className="mt-2 text-base text-zinc-400">{artworkSubtitle}</p>

            <div className="mt-5 border-t border-zinc-800/70 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Total Volume Progress
              </p>
              <div className="h-2.5 overflow-hidden rounded-sm border border-zinc-800 bg-zinc-900 shadow-inner">
                <div
                  className="h-full bg-[linear-gradient(90deg,#d4d4d8_0%,#a1a1aa_100%)]"
                  style={{ width: `${mintProgressPct}%` }}
                />
              </div>
              <p className="mt-2 text-center text-base font-medium text-zinc-300">
                {totalContributed.toFixed(2)} / {TARGET_ETH.toFixed(2)} ETH total volume
              </p>
              <p className="mt-1 text-center text-sm text-zinc-500">
                Mint closes once {TARGET_ETH.toFixed(2)} ETH is reached
              </p>
            </div>

            <div className="mt-4 space-y-1 border-t border-zinc-800/70 pt-3 text-base text-zinc-300">
              <p>
                Minted:{" "}
                <span className="font-semibold text-zinc-100">
                  {actualEditionsMinted}/{currentMaxTotalPossibleSupply}
                </span>
                <span className="ml-2 text-sm text-zinc-500">(orig. supply 100)</span>
              </p>

              <p>
                Minimum Mint: <span className="font-semibold text-zinc-100">{MIN_MINT_ETH.toFixed(2)} ETH</span>
              </p>
            </div>

            <div className="mt-5 border-t border-zinc-800/70 pt-4">
              <h3 className="text-lg font-semibold text-zinc-100">Your Payment Amount for 1 Edition</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Higher payment amounts increase rarity: your mint remains 1 edition, but increasing your payment reduces the max possible supply for this artwork.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <input
                  type="range"
                  min={MIN_MINT_ETH}
                  max={controlMaxContribution}
                  step={CONTRIBUTION_STEP}
                  value={effectiveContribution}
                  onChange={(event) => {
                    const nextValue = clampContribution(Number(event.target.value), controlMaxContribution);
                    setContribution(Number(nextValue.toFixed(2)));
                  }}
                  className="h-2 min-w-0 flex-1 appearance-none rounded-full bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-zinc-700 [&::-webkit-slider-thumb]:bg-[var(--slider-accent)] [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.2)] [&::-webkit-slider-thumb]:transition-none [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-zinc-800 [&::-moz-range-progress]:h-2 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-[var(--slider-accent)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-zinc-700 [&::-moz-range-thumb]:bg-[var(--slider-accent)] [&::-moz-range-thumb]:transition-none"
                  style={
                    {
                      "--slider-accent": impactAccentColor,
                      background: `linear-gradient(to right, ${impactAccentColor} 0%, ${impactAccentColor} ${sliderFillPct}%, #27272a ${sliderFillPct}%, #27272a 100%)`,
                    } as React.CSSProperties
                  }
                />
                <span className="min-w-[120px] whitespace-nowrap text-right text-lg font-semibold tabular-nums text-zinc-100">
                  {effectiveContribution.toFixed(2)} ETH
                </span>
              </div>
              <p className="mt-2 text-base font-semibold" style={{ color: impactAccentColor }}>
                You are reducing max supply by {supplyRemoved} {editionLabel(supplyRemoved)}
              </p>

              <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-sm border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-300">
                <div className="text-center">
                  <p className="text-xs text-zinc-500">Current</p>
                  <p className="text-lg font-semibold text-zinc-100">
                    {actualEditionsMinted}/{currentMaxTotalPossibleSupply}
                  </p>
                </div>
                <div className="text-center">
                  <p className="rounded-sm border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-base font-semibold text-zinc-100">
                    -{supplyRemoved}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-zinc-500">After You Mint</p>
                  <p className="text-lg font-semibold text-zinc-100">
                    {projectedMintedSupply}/{simulatedMaxTotalPossibleSupply}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={runSimulation}
              disabled={isSimulating || !canMint}
              className="mt-4 w-full rounded-sm border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-base font-semibold text-zinc-100 shadow-[0_6px_16px_rgba(0,0,0,0.25)] transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSimulating
                ? "Simulating..."
                : !canMint
                  ? "Fully Allocated"
                  : supplyRemoved > 0
                    ? (
                      <>
                        <span className="text-white">
                          Mint 1 Edition
                        </span>
                        <span style={{ color: impactAccentColor }}>{" & Reduce max supply by "}</span>
                        <span style={{ color: impactAccentColor }}>
                          {supplyRemoved} {editionLabel(supplyRemoved)}
                        </span>
                      </>
                    )
                    : `Mint 1 Edition`}
            </button>

            <div className="mt-4 space-y-1 border-t border-zinc-800/70 pt-4 text-base text-zinc-300">
              <button
                type="button"
                onClick={() => setIsMinterDialogOpen(true)}
                className="font-medium underline underline-offset-4 transition-colors hover:text-zinc-100"
              >
                Minted: <span className="font-semibold">{mintedCollectors} collectors</span>
              </button>
              <p>
                Largest Payment:{" "}
                <span className="font-semibold">{largestContribution.toFixed(2)} ETH</span>
              </p>
            </div>
          </div>
      </div>

      <Dialog open={isMinterDialogOpen} onOpenChange={setIsMinterDialogOpen}>
        <DialogContent
          size="auto"
          showCloseButton
          className="w-[min(1200px,96vw)] max-h-[82vh] overflow-hidden border border-zinc-800/80 bg-zinc-950 p-0 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="border-b border-zinc-800/80 px-6 py-4">
            <DialogTitle className="text-2xl text-zinc-100">
              Collector Payments
            </DialogTitle>
            <p className="mt-1 text-sm text-zinc-500">
              Ranked highest to lowest payment amount
            </p>
          </div>

          <div className="max-h-[64vh] overflow-y-auto px-6 py-4">
            <div className="mb-2 grid grid-cols-[minmax(0,1fr)_180px_180px] gap-4 border-b border-zinc-800/80 px-4 pb-2 text-xs text-zinc-500">
              <span>Collector</span>
              <span className="text-right">Payment</span>
              <span className="text-right">Editions Removed</span>
            </div>
            <div className="space-y-2">
              {minters.map((payment, index) => (
                <div
                  key={`${payment.wallet}-${index}`}
                  className="grid grid-cols-[minmax(0,1fr)_180px_180px] items-center gap-4 rounded-sm border border-zinc-800/70 bg-zinc-900/40 px-4 py-2"
                >
                  <span className="text-lg text-zinc-100">
                    #{index + 1} {payment.wallet}
                  </span>
                  <span className="text-right text-lg font-semibold text-zinc-100">
                    {payment.contribution.toFixed(2)} ETH
                  </span>
                  <span className="text-right text-lg text-zinc-300">
                    {editionsRemovedForContribution(payment.contribution)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
