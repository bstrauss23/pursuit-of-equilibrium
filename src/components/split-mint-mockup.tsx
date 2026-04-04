"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";

type SplitMintMockupProps = {
  artworkSrc: string;
  artworkTitle: string;
  artworkSubtitle: string;
  initialPhaseNumber?: number;
  initialCommittedCollectors?: number;
  initialTimeRemainingSeconds?: number;
};

const PHASE_SUPPLIES = [1, 2, 4, 8, 16, 32, 64] as const;
const PHASE_DURATION_SECONDS = 60 * 60;
const SHOW_TREE_CONNECTORS = true;

type CollectorCommitment = {
  id: number;
  wallet: string;
  phaseIndex: number;
  qty: number;
};

function generateMockWallet(seed: number): string {
  const chars = "0123456789abcdef";
  let hex = "";
  for (let i = 0; i < 8; i += 1) {
    const index = (seed + i * 7) % chars.length;
    hex += chars[index] ?? "0";
  }
  return `0x${hex.slice(0, 4)}...${hex.slice(4)}`;
}

function buildInitialCommitments(count: number, phaseIndex: number): CollectorCommitment[] {
  if (count <= 0) return [];
  const currentPhaseNumber = phaseIndex + 1;

  const phaseAssignments = (() => {
    if (currentPhaseNumber <= 1) {
      return Array.from({ length: count }, () => 1);
    }

    // For early/small states keep it simple and recent.
    if (count <= 3) {
      const previousPhaseNumber = Math.max(1, currentPhaseNumber - 1);
      const carryForwardCount = Math.max(0, Math.floor(count / 2));
      return Array.from({ length: count }, (_, index) =>
        index < carryForwardCount ? previousPhaseNumber : currentPhaseNumber
      );
    }

    // For richer states, spread commitments across multiple past phases.
    const assignments: number[] = [];
    let cursor = currentPhaseNumber;
    while (assignments.length < count) {
      assignments.push(cursor);
      cursor -= 1;
      if (cursor < 1) {
        cursor = currentPhaseNumber;
      }
    }
    return assignments;
  })();

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    wallet: generateMockWallet(100 + phaseIndex * 17 + index * 11),
    phaseIndex: phaseAssignments[index] ?? currentPhaseNumber,
    qty: 1,
  }));
}

function formatTimeRemaining(totalSeconds: number) {
  const clamped = Math.max(0, totalSeconds);
  const hours = Math.floor(clamped / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((clamped % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(clamped % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}h : ${minutes}m : ${seconds}s`;
}

function formatEth(value: number) {
  return value.toFixed(6).replace(/\.?0+$/, "");
}

function TreeRow({
  count,
  minted,
  muted,
  showTopStub,
  showFutureStubs,
  className,
}: {
  count: number;
  minted: number;
  muted?: boolean;
  showTopStub?: boolean;
  showFutureStubs?: boolean;
  className?: string;
}) {
  const width = 920;
  const boxSize = count === 1 ? 82 : count <= 2 ? 70 : count <= 4 ? 54 : count <= 8 ? 38 : count <= 16 ? 26 : count <= 32 ? 16 : 10;
  const boxY = 46;
  const lineY = boxY - 22;
  const sidePadding = boxSize / 2 + 12;
  const usableWidth = width - sidePadding * 2;
  const step = count > 1 ? usableWidth / (count - 1) : 0;
  const centers = count === 1 ? [width / 2] : Array.from({ length: count }, (_, i) => sidePadding + i * step);
  const boxLeft = centers.map((x) => x - boxSize / 2);
  const overallCenter = width / 2;
  const rowOpacityClass = muted ? "opacity-45" : "opacity-100";

  return (
    <svg viewBox={`0 0 ${width} 190`} className={`w-full ${rowOpacityClass} ${className ?? ""}`} aria-hidden>
      <g>
        {showTopStub && SHOW_TREE_CONNECTORS ? (
          <line
            x1={overallCenter}
            y1={2}
            x2={overallCenter}
            y2={lineY - 24}
            stroke="rgba(245,245,245,0.45)"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
        ) : null}

        {count === 1 && showTopStub && SHOW_TREE_CONNECTORS ? (
          <line x1={overallCenter} y1={lineY - 12} x2={overallCenter} y2={boxY} stroke="rgba(245,245,245,0.4)" strokeWidth="2" />
        ) : null}

        {count > 1 && SHOW_TREE_CONNECTORS ? (
          <g>
            <line
              x1={centers[0] ?? overallCenter}
              y1={lineY}
              x2={centers[centers.length - 1] ?? overallCenter}
              y2={lineY}
              stroke="rgba(245,245,245,0.55)"
              strokeWidth="2"
            />
            <line
              x1={overallCenter}
              y1={lineY - 36}
              x2={overallCenter}
              y2={lineY}
              stroke="rgba(245,245,245,0.55)"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <line
              x1={centers[0] ?? overallCenter}
              y1={lineY}
              x2={centers[0] ?? overallCenter}
              y2={boxY - 6}
              stroke="rgba(245,245,245,0.55)"
              strokeWidth="2"
            />
            <line
              x1={centers[centers.length - 1] ?? overallCenter}
              y1={lineY}
              x2={centers[centers.length - 1] ?? overallCenter}
              y2={boxY - 6}
              stroke="rgba(245,245,245,0.55)"
              strokeWidth="2"
            />
          </g>
        ) : null}
      </g>

      {boxLeft.map((x, index) => {
        const isMinted = index < minted;
        const boxKey = `node-${index}`;
        return (
          <g key={boxKey}>
            <rect
              x={x}
              y={boxY}
              width={boxSize}
              height={boxSize}
              rx="0"
              fill={isMinted ? "rgba(255,255,255,1)" : "none"}
              stroke="rgba(245,245,245,0.9)"
              strokeWidth="2"
            />
          </g>
        );
      })}

      {showFutureStubs && SHOW_TREE_CONNECTORS
        ? centers.map((x, i) => {
            return (
              <line
                key={`future-${i}`}
                x1={x}
                y1={boxY + boxSize}
                x2={x}
                y2={boxY + boxSize + 16}
                stroke="rgba(245,245,245,0.55)"
                strokeWidth="2"
              />
            );
          })
        : null}
    </svg>
  );
}

export function SplitMintMockup({
  artworkSrc,
  artworkTitle,
  artworkSubtitle,
  initialPhaseNumber = 3,
  initialCommittedCollectors = 2,
  initialTimeRemainingSeconds = 26 * 60,
}: SplitMintMockupProps) {
  const normalizedPhaseIndex = Math.max(0, Math.min(PHASE_SUPPLIES.length - 1, initialPhaseNumber - 1));
  const normalizedInitialCollectors = Math.max(0, initialCommittedCollectors);
  const initialSupply = PHASE_SUPPLIES[normalizedPhaseIndex] ?? PHASE_SUPPLIES[0];
  const initialMintedCount = Math.min(normalizedInitialCollectors, initialSupply);

  const [phaseIndex, setPhaseIndex] = useState(normalizedPhaseIndex);
  const [mintedCount, setMintedCount] = useState(initialMintedCount);
  const [phaseSnapshots, setPhaseSnapshots] = useState<Array<number | null>>(() => {
    const snapshots: Array<number | null> = Array.from({ length: PHASE_SUPPLIES.length }, () => null);
    if (normalizedPhaseIndex > 0) {
      const previousSupply = PHASE_SUPPLIES[normalizedPhaseIndex - 1] ?? 1;
      snapshots[normalizedPhaseIndex - 1] = Math.min(Math.floor(normalizedInitialCollectors / 2), previousSupply);
    }
    return snapshots;
  });
  const [collectorCommitments, setCollectorCommitments] = useState<CollectorCommitment[]>(
    () => buildInitialCommitments(normalizedInitialCollectors, normalizedPhaseIndex)
  );
  const [qty, setQty] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(Math.max(0, initialTimeRemainingSeconds));
  const [isMinting, setIsMinting] = useState(false);
  const [isTreeDialogOpen, setIsTreeDialogOpen] = useState(false);
  const [isCollectorDialogOpen, setIsCollectorDialogOpen] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const mintTimerRef = useRef<number | null>(null);
  const infoTriggerRef = useRef<HTMLButtonElement | null>(null);
  const infoTooltipRef = useRef<HTMLDivElement | null>(null);

  const currentSupply = PHASE_SUPPLIES[phaseIndex] ?? PHASE_SUPPLIES[PHASE_SUPPLIES.length - 1];
  const nextSupply = PHASE_SUPPLIES[phaseIndex + 1] ?? null;
  const maxQty = Math.max(0, currentSupply - mintedCount);
  const effectiveQty = maxQty <= 0 ? 1 : Math.min(qty, maxQty);
  const unitPrice = useMemo(() => 1 / currentSupply, [currentSupply]);
  const totalPrice = useMemo(() => unitPrice * effectiveQty, [effectiveQty, unitPrice]);
  const isPhaseClosed = mintedCount >= currentSupply;
  const canMint = maxQty > 0 && !isMinting;
  const collectors = collectorCommitments.length;
  const collectorRows = useMemo(() => {
    const byWallet = new Map<string, { phases: number[]; totalQty: number }>();

    for (const commitment of collectorCommitments) {
      const existing = byWallet.get(commitment.wallet) ?? { phases: [], totalQty: 0 };
      if (!existing.phases.includes(commitment.phaseIndex)) {
        existing.phases.push(commitment.phaseIndex);
        existing.phases.sort((a, b) => a - b);
      }
      existing.totalQty += commitment.qty;
      byWallet.set(commitment.wallet, existing);
    }

    return Array.from(byWallet.entries()).map(([wallet, data]) => ({
      wallet,
      phasesLabel: data.phases.map((phase) => `P${phase}`).join(", "),
      totalQty: data.totalQty,
    }));
  }, [collectorCommitments]);
  const phaseRows = useMemo(
    () =>
      PHASE_SUPPLIES.map((supply, index) => {
        const rowMinted =
          index < phaseIndex
            ? Math.min(phaseSnapshots[index] ?? 0, supply)
            : index === phaseIndex
              ? Math.min(mintedCount, supply)
              : Math.min(mintedCount, supply);
        return { supply, rowMinted, index };
      }),
    [mintedCount, phaseIndex, phaseSnapshots]
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      setTimeRemaining((current) => {
        if (current > 0) {
          return current - 1;
        }

        if (mintedCount >= currentSupply) {
          return 0;
        }

        setPhaseSnapshots((previous) => {
          const next = previous.slice();
          next[phaseIndex] = mintedCount;
          return next;
        });
        setPhaseIndex((value) => Math.min(value + 1, PHASE_SUPPLIES.length - 1));
        return PHASE_DURATION_SECONDS;
      });
    }, 1000);

    return () => {
      window.clearInterval(id);
    };
  }, [currentSupply, mintedCount, phaseIndex]);

  useEffect(() => {
    return () => {
      if (mintTimerRef.current !== null) {
        window.clearTimeout(mintTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isInfoTooltipOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (infoTriggerRef.current?.contains(target)) return;
      if (infoTooltipRef.current?.contains(target)) return;
      setIsInfoTooltipOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isInfoTooltipOpen]);

  function adjustQty(direction: -1 | 1) {
    if (maxQty <= 0) return;
    setQty((current) => {
      const next = current + direction;
      if (next < 1) return 1;
      if (next > maxQty) return maxQty;
      return next;
    });
  }

  function handleMint() {
    if (!canMint || effectiveQty < 1) return;
    setIsMinting(true);

    mintTimerRef.current = window.setTimeout(() => {
      setMintedCount((current) => Math.min(current + effectiveQty, currentSupply));
      setCollectorCommitments((current) => [
        ...current,
        {
          id: current.length + 1,
          wallet: generateMockWallet(current.length + phaseIndex + effectiveQty),
          phaseIndex: phaseIndex + 1,
          qty: effectiveQty,
        },
      ]);
      setIsMinting(false);
      toast.success("Mint successful!");
      mintTimerRef.current = null;
    }, 800);
  }

  function advanceToNextPhaseForDemo() {
    if (!nextSupply) return;
    setPhaseSnapshots((previous) => {
      const next = previous.slice();
      next[phaseIndex] = mintedCount;
      return next;
    });
    setPhaseIndex((value) => Math.min(value + 1, PHASE_SUPPLIES.length - 1));
    setTimeRemaining(PHASE_DURATION_SECONDS);
  }

  return (
    <div className="grid w-full gap-5 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-stretch">
      <div className="mx-auto w-full overflow-hidden rounded-none border border-zinc-800/80 bg-zinc-950 shadow-[0_10px_30px_rgba(0,0,0,0.35)] lg:h-full lg:w-auto lg:shrink-0">
        <Image
          src={artworkSrc}
          alt={artworkTitle}
          width={1024}
          height={1024}
          className="block h-auto w-full object-contain lg:h-full lg:w-auto lg:max-w-none"
          priority
        />
      </div>

      <div className="rounded-none border border-zinc-800/80 bg-zinc-950 p-5 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)] md:p-6">
        <h2 className="font-mono text-4xl leading-none text-zinc-100 text-center md:text-left">{artworkTitle}</h2>
        <p className="mt-2 font-mono text-base text-zinc-400 text-center md:text-left">{artworkSubtitle}</p>

        <section className="mt-5 border-y border-zinc-800/70 bg-[linear-gradient(135deg,rgba(23,29,40,0.52),rgba(38,44,56,0.32))] px-8 py-8">
          <div className="mb-5 flex flex-col items-center gap-4 md:mb-3 md:flex-row md:items-start md:justify-between">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <p className="text-base leading-none tracking-[0.08em] text-zinc-100 uppercase">
                  {isPhaseClosed ? "PROGRESS: Mint Closed" : `PROGRESS: PHASE ${phaseIndex + 1}`}
                </p>
                <TooltipProvider>
                  <Tooltip open={isInfoTooltipOpen} onOpenChange={() => {}}>
                    <TooltipTrigger asChild>
                      <button
                        ref={infoTriggerRef}
                        type="button"
                        tabIndex={-1}
                        aria-label="How the split mint works"
                        onClick={(event) => {
                          event.stopPropagation();
                          setIsInfoTooltipOpen((current) => !current);
                        }}
                        className="no-hover-fill inline-flex h-4 w-4 items-center justify-center border border-zinc-100 bg-transparent text-[10px] leading-none text-zinc-100"
                      >
                        i
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      ref={infoTooltipRef}
                      side="top"
                      sideOffset={8}
                      className="max-w-[340px] rounded-none border border-zinc-700 bg-zinc-950 text-zinc-100"
                    >
                      Each phase has a timer and fixed supply. If it sells out, the mint ends. If not, committed collectors
                      carry forward and prices adjust with automatic refunds.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="mt-1 text-xs tracking-[0.06em] text-zinc-400 uppercase">Edition of {currentSupply}</p>
              {!isPhaseClosed ? (
                <p className="mt-1 text-xs tracking-[0.06em] text-zinc-400 uppercase">Price: {formatEth(unitPrice)} ETH</p>
              ) : null}
            </div>
            {!isPhaseClosed ? (
              <div className="w-full text-center md:w-auto md:text-right">
                <p className="text-sm leading-none tracking-[0.04em] text-zinc-300">Phase Time Remaining:</p>
                <p className="mt-1 inline-flex items-center justify-center gap-2 text-base leading-none tabular-nums text-zinc-100 md:justify-end">
                  <span className="current-phase-pulse inline-block h-1.5 w-1.5 bg-zinc-100" aria-hidden />
                  <span>{formatTimeRemaining(timeRemaining)}</span>
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-10 space-y-3 md:mt-8">
            <p
              className={`text-center text-xs tracking-[0.08em] text-zinc-100 uppercase ${isPhaseClosed ? "" : "current-phase-pulse"}`}
            >
              {isPhaseClosed ? "Final Phase" : "Current Phase"}
            </p>
            <TreeRow count={currentSupply} minted={mintedCount} showTopStub={phaseIndex > 0} />
            {!isPhaseClosed && nextSupply ? (
              <div className="-mt-6 opacity-45">
                <button
                  type="button"
                  onClick={advanceToNextPhaseForDemo}
                  className="no-hover-fill mx-auto block cursor-default appearance-none border-0 bg-transparent p-0 text-center text-xs tracking-[0.08em] text-zinc-400 uppercase outline-none"
                >
                  Next Split Phase
                </button>
                <TreeRow count={nextSupply} minted={Math.min(mintedCount, nextSupply)} muted />
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex flex-col items-center gap-1 text-center md:mt-2 md:flex-row md:items-start md:justify-between md:gap-4 md:text-left">
            <div>
              <p className="text-base leading-none tracking-[0.05em] text-zinc-100">
                {mintedCount} of {currentSupply} minted
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                This phase must fully mint before the timer ends to close the mint at an edition of {currentSupply}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsTreeDialogOpen(true)}
              className="no-hover-fill whitespace-nowrap text-sm text-zinc-300 underline underline-offset-4 transition-colors hover:text-zinc-100 md:mt-0"
            >
              view tree
            </button>
          </div>
        </section>

        {isPhaseClosed ? (
          <section className="mt-4 rounded-none bg-[#09090b] py-4 text-center">
            <p className="text-lg tracking-[0.06em] text-zinc-100 uppercase">Mint Closed at Phase {phaseIndex + 1}</p>
            <p className="mt-2 text-sm tracking-[0.06em] text-zinc-400 uppercase">Edition of {currentSupply}</p>
          </section>
        ) : (
          <section className="mt-4 rounded-none bg-[#09090b] py-4">
            <div className="flex w-full flex-col items-center gap-3 md:flex-row md:items-center md:justify-between md:gap-5">
              <div className="flex items-center gap-3 md:flex-none">
                <span className="text-lg leading-none tracking-[0.08em] text-zinc-100">Qty</span>
                <div className="flex items-center gap-2 md:pr-2">
                  <div className="relative">
                    <div className="grid h-12 w-36 grid-cols-3 overflow-hidden rounded-none border border-zinc-700 bg-zinc-900 text-center">
                      <button
                        type="button"
                        onClick={() => adjustQty(-1)}
                        disabled={!canMint || qty <= 1}
                        className="text-lg text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-600"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <div className="flex items-center justify-center border-x border-zinc-700 text-lg tabular-nums text-zinc-100">{effectiveQty}</div>
                      <button
                        type="button"
                        onClick={() => adjustQty(1)}
                        disabled={!canMint || effectiveQty >= maxQty}
                        className="text-lg text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:text-zinc-600"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQty(maxQty > 0 ? maxQty : 1)}
                      disabled={!canMint || effectiveQty >= maxQty}
                      className="no-hover-fill ml-2 cursor-pointer bg-transparent text-[10px] text-zinc-500 underline underline-offset-2 transition-colors hover:text-zinc-300 disabled:cursor-not-allowed disabled:text-zinc-700 md:absolute md:right-1 md:top-full md:ml-0 md:mt-1"
                    >
                      max
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleMint}
                disabled={!canMint}
                className="h-12 w-full max-w-[520px] min-w-0 md:flex-1 md:max-w-none rounded-none border border-white bg-zinc-900 px-4 text-lg tracking-[0.04em] text-zinc-100 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {isMinting ? (
                  "Minting..."
                ) : canMint ? (
                  <span className="inline-flex items-center gap-3">
                    <span>Mint {effectiveQty}</span>
                    <span className="h-5 w-px bg-zinc-500" aria-hidden />
                    <span>{formatEth(totalPrice)} ETH</span>
                  </span>
                ) : (
                  "Phase Full"
                )}
              </button>
            </div>
          </section>
        )}

        <div className="mt-4 md:mt-8 text-sm text-zinc-400 text-center md:text-left">
          <button
            type="button"
            onClick={() => setIsCollectorDialogOpen(true)}
            className="no-hover-fill font-medium underline underline-offset-4 transition-colors hover:text-zinc-100"
          >
            Committed Collectors: <span className="font-semibold">{collectors}</span>
          </button>
        </div>

        <p className="sr-only">Current phase unit price: {formatEth(unitPrice)} ETH</p>
      </div>

      <Dialog open={isTreeDialogOpen} onOpenChange={setIsTreeDialogOpen}>
        <DialogContent
          size="auto"
          showCloseButton
          className="max-w-[95vw] w-auto max-h-[95vh] overflow-y-auto rounded-none border border-zinc-700 bg-[#17181b] p-6 text-zinc-100"
        >
          <DialogTitle className="text-lg tracking-[0.06em] uppercase">Split Tree View</DialogTitle>

          <div className="mt-3 space-y-1 border-y border-zinc-800/70 py-8">
            {phaseRows.map((row) => (
              <div
                key={`phase-row-${row.index}`}
                className={row.index === phaseIndex ? "opacity-100" : "opacity-45"}
              >
                {row.index === phaseIndex ? (
                  <p className="mb-2 text-center text-lg tracking-[0.06em] text-zinc-100 uppercase">Current Phase</p>
                ) : null}
                <div className="mb-1 flex items-center justify-between text-xs tracking-[0.06em] text-zinc-300 uppercase">
                  <span>Phase {row.index + 1}</span>
                  <span>{row.supply === 1 ? "1 of 1" : `Edition of ${row.supply}`}</span>
                </div>
                <TreeRow
                  count={row.supply}
                  minted={row.rowMinted}
                  muted={row.index !== phaseIndex}
                  className="mx-auto w-[980px] sm:w-[1080px] md:w-[1180px] max-w-full"
                />
              </div>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm uppercase tracking-[0.08em] text-zinc-300">Collector Commit History</p>
            <div className="mt-2 space-y-1">
              {collectorCommitments.map((entry) => (
                <div key={`commit-${entry.id}`} className="flex items-center justify-between text-sm text-zinc-200">
                  <span>{entry.wallet}</span>
                  <span>
                    Phase {entry.phaseIndex} · Qty {entry.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCollectorDialogOpen} onOpenChange={setIsCollectorDialogOpen}>
        <DialogContent
          size="auto"
          showCloseButton
          className="w-[min(1100px,96vw)] max-h-[82vh] overflow-hidden rounded-none border border-zinc-800/80 bg-zinc-950 p-0 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        >
          <div className="border-b border-zinc-800/80 px-6 py-4">
            <DialogTitle className="text-2xl text-zinc-100">Committed Collectors</DialogTitle>
          </div>

          <div className="max-h-[64vh] overflow-y-auto px-6 py-4">
            <div className="mb-2 grid grid-cols-[minmax(0,1fr)_220px_220px] gap-4 border-b border-zinc-800/80 px-4 pb-2 text-xs text-zinc-500">
              <span>Collector</span>
              <span className="text-right">Phase(s) Committed</span>
              <span className="text-right">Total Qty Committed</span>
            </div>
            <div className="space-y-2">
              {collectorRows.map((row, index) => (
                <div
                  key={`${row.wallet}-${index}`}
                  className="grid grid-cols-[minmax(0,1fr)_220px_220px] items-center gap-4 rounded-none border border-zinc-800/70 bg-zinc-900/40 px-4 py-2"
                >
                  <span className="text-lg text-zinc-100">{row.wallet}</span>
                  <span className="text-right text-lg text-zinc-200">{row.phasesLabel}</span>
                  <span className="text-right text-lg font-semibold text-zinc-100">{row.totalQty}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
