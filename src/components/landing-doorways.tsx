"use client";

import Link from "next/link";
import { useState } from "react";
import { DoorwayImage } from "@/components/doorway-image";

export function LandingDoorways() {
  const [luxLoaded, setLuxLoaded] = useState(false);
  const [pendulumsLoaded, setPendulumsLoaded] = useState(false);
  const reveal = luxLoaded && pendulumsLoaded;

  return (
    <section className="relative -mx-4 -mt-8 -mb-8 h-[calc(100vh-4rem)] overflow-hidden md:-mx-6">
      <div className="pointer-events-none absolute inset-0 z-20">
        <div className="doorway-pendulum-mask doorway-pendulum-mask-lux">
          <div className="doorway-pendulum-anchor">
            <div className="doorway-pendulum-stack">
              <div className="doorway-pendulum doorway-pendulum-white">
                <div className="doorway-pendulum-rod" />
                <div className="doorway-pendulum-bob" />
              </div>
            </div>
          </div>
        </div>

        <div className="doorway-pendulum-mask doorway-pendulum-mask-pendulums">
          <div className="doorway-pendulum-anchor">
            <div className="doorway-pendulum-stack">
              <div className="doorway-pendulum doorway-pendulum-black">
                <div className="doorway-pendulum-rod" />
                <div className="doorway-pendulum-bob" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid h-full grid-cols-1 md:grid-cols-2">
        <Link
          href="/lux"
          className="group relative flex min-h-[50vh] items-center justify-center border-r-0 border-b border-border px-6 text-center transition md:min-h-0 md:border-r md:border-b-0"
        >
          <DoorwayImage
            src="/Lux-doorway.jpg"
            alt="Lux doorway"
            priority
            reveal={reveal}
            onLoaded={() => setLuxLoaded(true)}
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 space-y-3">
            <p className="text-sm tracking-[0.2em] text-zinc-300 uppercase">Chapter 1</p>
            <h2 className="text-6xl tracking-[0.12em] text-white transition-all duration-500 ease-out group-hover:tracking-[0.30em]">
              LUX
            </h2>
            <p className="text-base text-zinc-300">Enter Chapter I</p>
          </div>
        </Link>

        <Link
          href="/pendulums"
          className="group relative flex min-h-[50vh] items-center justify-center px-6 text-center transition md:min-h-0"
        >
          <DoorwayImage
            src="/Pendulums-doorway.jpeg"
            alt="Pendulums doorway"
            priority
            reveal={reveal}
            onLoaded={() => setPendulumsLoaded(true)}
          />
          <div className="absolute inset-0 bg-white/45" />
          <div className="relative z-10 space-y-3">
            <p className="text-sm tracking-[0.2em] text-zinc-600 uppercase">Chapter 2</p>
            <h2 className="text-6xl tracking-[0.12em] text-zinc-900 transition-all duration-500 ease-out group-hover:tracking-[0.2em]">
              PENDULUMS
            </h2>
            <p className="text-base text-zinc-600">Enter Chapter II</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
