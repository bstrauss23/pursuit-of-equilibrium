import type { Metadata } from "next";
import { PrologueGate } from "@/components/prologue-gate";
import { PrologueMintGallery } from "@/components/prologue-mint-gallery";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Prologue | Pursuit of Equilibrium",
  description: "Private page for shared direct-link access.",
  path: "/prologue",
  image: "/PoE-opengraph.jpg",
});

export default function ProloguePage() {
  return (
    <PrologueGate>
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
              <p className="text-sm tracking-[0.2em] text-zinc-300 uppercase md:text-lg">Prologue</p>
              <h1 className="text-4xl tracking-[0.2em] text-zinc-100 md:text-8xl">PRIMUS</h1>
            </div>
            {/* <h2 className="text-lg tracking-[0.08em] text-zinc-200 md:text-2xl">
              Night One
            </h2> */}
            <h3 className="text-base tracking-[0.08em] text-zinc-300 md:text-lg">by BEN STRAUSS</h3>
          </div>
          <PrologueMintGallery />
        </div>
      </section>
    </PrologueGate>
  );
}
